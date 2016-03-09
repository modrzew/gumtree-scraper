from datetime import datetime, timedelta
from collections import namedtuple
import sys
import time

from bs4 import BeautifulSoup
from tinydb import TinyDB, Query
import dateutil
import requests


# CONFIGURABLE THINGS
# Local equivalents of "minutes" and "hours"
TIMEDELTA_HOURS = ('godz', 'hour')
TIMEDELTA_MINS = ('min',)

# Structures
Result = namedtuple(
    'Result',
    ['title', 'price', 'url', 'image_url', 'description', 'created_at']
)
# Variables
LAST_RUN_FILENAME = '.lastrun'
DB_FILENAME = '.db'
REFRESH_SECONDS = 300


def _read_last_run():
    with open(LAST_RUN_FILENAME, 'r') as f:
        raw = f.read()
    try:
        return dateutil.parse(raw)
    except Exception:
        return None


def _write_last_run(last_run=None):
    if not last_run:
        last_run = datetime.now()
    with open(LAST_RUN_FILENAME, 'w') as f:
        f.write(last_run.isoformat())


def _parse_date(value):
    """Converts relative time to absolute

    e.g. '43 min temu' => datetime()
    """
    # I assume Polish locale
    parts = value.strip().split(maxsplit=1)
    amount = int(parts[0])
    for hour_part in TIMEDELTA_HOURS:
        if hour_part in parts[1]:
            delta = timedelta(hours=amount)
            break
    else:
        for minute_part in TIMEDELTA_MINS:
            if minute_part in parts[1]:
                delta = timedelta(minutes=amount)
                break
    return datetime.now() - delta


def _parse_price(value):
    """Converts '2\xa000 zł' into integer"""
    value = value.strip().split()
    parts = []
    for part in value:
        try:
            part = int(part)
            parts.append(str(part))
        except ValueError:
            pass
    return int(''.join(parts))


def _parse_result(li):
    # Simple fields
    title = li.select_one('div.title a').string.strip()
    price = _parse_price(li.select_one('div.price .value .amount').string)
    url = li.select_one('.title .href-link')['href']
    url = 'http://www.gumtree.pl' + url
    # Image - it may be there, it may not
    if 'pictures' in li['class']:
        if 'data-src' in li.select_one('.thumb img').attrs:
            image_url = li.select_one('.thumb img')['data-src']
        else:
            image_url = li.select_one('.thumb img')['src']
    else:
        image_url = None
    # Description is split into 2: first part visible, second hidden
    descriptions = li.select('div.description span')
    description = ''.join(d.string for d in descriptions)
    # Remove calendar icon
    creation_date = li.select_one('.creation-date')
    creation_date.select_one('.icon-calendar').extract()
    created_at_raw = creation_date.select_one('span').string
    created_at = _parse_date(created_at_raw)
    return Result(
        title=title,
        price=price,
        url=url,
        image_url=image_url,
        description=description,
        created_at=created_at,
    )


def _prepare_query(result):
    return Query().url == result.url


def _to_dict(result):
    output = result._asdict()
    output['created_at'] = output['created_at'].isoformat()
    output['seen'] = False
    return output


def scrap(url):
    db = TinyDB(DB_FILENAME)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    # Remove promoted section
    soup.select_one('div.view.top-listings').extract()
    # Remove reply window
    soup.select_one('li.result.reply').extract()
    # Find all results
    results = []
    for li in soup.select('li.result'):
        results.append(_parse_result(li))
    # Skip those that are already there - single result found will break out
    # of the loop
    valid = []
    for result in results:
        if db.contains(_prepare_query(result)):
            break
        db.insert(_to_dict(result))
        valid.append(result)
    db.close()
    return valid


def _pretty_print(string):
    sys.stdout.write('\r' + string)
    sys.stdout.flush()


if __name__ == '__main__':
    url = str(input('Enter URL: '))
    while True:
        try:
            results = scrap(url)
            if results:
                for result in results:
                    print(result)
            else:
                print('Nothing found.')
            for i in range(REFRESH_SECONDS, 0, -1):
                _pretty_print('Sleeping. Next refresh in {} seconds'.format(i))
                time.sleep(1)
            print()
        except KeyboardInterrupt:
            print('Exiting.')
            break
