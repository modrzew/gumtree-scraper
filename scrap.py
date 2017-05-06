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
TIMEDELTA_HOURS = ('hour', 'hours')
TIMEDELTA_MINS = ('minute','minutes')

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
    parts = value.strip().split(' ', 2)
    try:
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
        return datetime.utcnow() - delta
    except:
        return None

def _parse_result(li):
    # Simple fields
    title = li.select_one('div > div > div.ad-listing__details > div > h6 > a > span').string.strip()
    # print title
    title_date = li.select_one('div > div > div.ad-listing__details > div.ad-listing__extra-info > div.ad-listing__date').string.strip()
    created_at = _parse_date(title_date)

    price_span = li.select_one('div > div > div.ad-listing__details > div > div > div > span').contents

    price = None
    try:
        price_item = price_span[2].replace(",", "").strip()
        intPrice = float(price_item)
        price = price_span[2].strip()
    except Exception as err:
        pass
    
    # print price

    url = li.select_one('div > div > div.ad-listing__details > div > h6 > a')['href']
    url = 'https://www.gumtree.com.au' + url

    image_url = None
    try:
        image_url = li.select_one('div > div > div.ad-listing__thumb-container > a > span > img')['src']
    except:
        pass
    # print url
    # # Image - it may be there, it may not
    # if 'pictures' in li['class']:
    #     if 'data-src' in li.select_one('.thumb img').attrs:
    #         image_url = li.select_one('.thumb img')['data-src']
    #     else:
    #         image_url = li.select_one('.thumb img')['src']
    # else:
    #     image_url = None
    # Description is split into 2: first part visible, second hidden
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    description = soup.select_one('#ad-description-details')
    # print description

    if created_at is None:
        date_str = soup.select_one('.ad-details__ad-attribute-value').string.strip()
        created_at = datetime.strptime(date_str, "%d/%m/%Y")
        # print created_at

    return Result(
        title=title,
        price=price,
        url=url,
        image_url=image_url,
        description=str(description),
        created_at=created_at,
    )


def _prepare_query(result):
    return Query().url == result.url


def _to_dict(result):
    output = result._asdict()
    output['created_at'] = output['created_at'].isoformat()
    output['hidden'] = False
    output['seen'] = False
    output['starred'] = False
    return output


def scrap(url):
    db = TinyDB(DB_FILENAME)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    results = []
    count = 0
    for li in soup.select('.srp__recent-ads .ad-listing__item'):
        results.append(_parse_result(li))
        count+=1
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
    url = str(raw_input('Enter URL: '))
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
