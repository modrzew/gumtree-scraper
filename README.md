# gumtree-scraper

This tool was written during the last time (March 2016) I looked for an
apartment to rent. The most popular website for that in Poland (and probably
in other parts of Europe) was [Gumtree](http://gumtree.pl). Kind of annoyed
with their interface (though it didn't matter to my girlfriend, who was
searching with me), and also disappointed by fact that Gumtree removed built-in
RSS feeds, I decided to write simple scraper.

## Features

- prettier list of offers (when compared with Gumtree's)
- ability to hide or star particular offer
	- starred offer can't be hidden until it's unstarred
- offers are only *added*; when something gets removed from Gumtree, it's still
  here
- it's *your* database, and you can do whatever you want with it
- autorefresh for both backend and frontend
- fancy "Hide all" button to get rid of all visible entries when you're done
  (except for starred - those stay no matter what)

## Tech stuff

### Requirements

- Python 3.5
- npm

### Notable libraries used

- Flask
- React
- [TinyDB](http://tinydb.readthedocs.org/) (yup, it's not threadsafe, so you
  may consider switching to other DB provider before going live - but for us
  it was sufficient)

### Installation

Pretty straightforward. virtualenv or pyenv (or both) are recommended.

```
pip install -r requirements
npm install
./node_modules/webpack/bin/webpack.js -d
```

### Running

No daemonization yet - meaning you need 2 shells to run these:

```
python scrap.py
python server.py
```

### Architecture

#### Scraper

Resides in `scrap.py`. Crawls over 1st page of Gumtree results and stores them
in DB. Rinses and repeats every 5 minutes. Note: you need to provide URL for
Gumtree results page after running it (as each category has different URL;
that means you may also use filters, because they get appended to URL).

#### Server (Flask)

You can find it in `server.py`. Static page used to bootstrap React and
a couple of endpoints for manipulating entries.

#### Client (React)

A couple of components residing in `js/index.jsx`. I didn't find enough reasons
to go overboard with JS modules, thus everything is in single file.

## OK, looks great... but why?

Clicking through all offers with their pagination was tiring. Moreover, I think
their interface is not the most readable one I've ever seen; besides, I like to
see *all* opportunities, and most of the offers are added to their site either
1) when I'm at work, or 2) late in the evening. So I could have had a late
start when applying for an apartment - and believe me, the best offers are
grabbed in matter of hours, if not *minutes*.

Moreover, there were 2 people looking for a flat, and Gumtree doesn't offer any
sharing features - we used Trello to manage our results, but we had to make
extra effort to ensure we're not looking through an offer twice (thus wasting
time).

And on top of that - it was a fun side project.

## License

See [LICENSE.md](LICENSE.md).
