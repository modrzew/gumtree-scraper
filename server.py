from flask import (
    Flask,
    json,
    redirect,
    render_template,
)
from tinydb import TinyDB, Query


# Configurables
DB_FILENAME = '.db'

app = Flask(__name__)


@app.route('/')
def main():
    # TODO: this should be React, not Jinja
    db = TinyDB(DB_FILENAME)
    results = db.search(Query().seen == False)
    db.close()
    for result in results:
        result['eid'] = result.eid
    results.sort(key=lambda r: r['created_at'])
    return render_template('list.html', results=results)


@app.route('/api')
def api():
    db = TinyDB(DB_FILENAME)
    results = db.search(Query().seen == False)
    db.close()
    for result in results:
        result['eid'] = result.eid
    results.sort(key=lambda r: r['created_at'])
    return json.dumps(results)


@app.route('/goto/<int:eid>')
def goto(eid):
    db = TinyDB(DB_FILENAME)
    result = db.get(eid=eid)
    db.update({'seen': True}, eids=[eid])
    db.close()
    return redirect(result['url'], code=302)


@app.route('/clear_all')
def clear_all():
    db = TinyDB(DB_FILENAME)
    eids = [r.eid for r in db.search(Query().seen == False)]
    db.update({'seen': True}, eids=eids)
    db.close()
    return 'OK'


if __name__ == '__main__':
    app.run(debug=True)
