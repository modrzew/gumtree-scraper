from datetime import datetime, timedelta
from collections import namedtuple

from bs4 import BeautifulSoup
import dateutil
import requests

## Configurable things
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


def scrap(url):
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
    return results


if __name__ == '__main__':
    url = str(input('Enter URL: '))
    results = scrap(url)
    for result in results:
        print(result)
