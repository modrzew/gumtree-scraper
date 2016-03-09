from datetime import datetime
from collections import namedtuple

from bs4 import BeautifulSoup
import dateutil
import requests


Result = namedtuple(
    'Result',
    ['title', 'price', 'url', 'image_url', 'description']
)


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
        title = li.select_one('div.title a').string
        results.append(title)
    return results


if __name__ == '__main__':
    url = str(input('Enter URL: '))
    results = scrap(url)
    for result in results:
        print(result)
