from flask import Flask, json, redirect
from tinydb import TinyDB, Query


# Configurables
DB_FILENAME = '.db'

app = Flask(__name__)


@app.route('/api')
def api():
    db = TinyDB(DB_FILENAME)
    results = db.search(Query().seen == False)
    db.close()
    for result in results:
        result['eid'] = result.eid
    return json.dumps(results)


@app.route('/goto/<int:eid>')
def goto(eid):
    db = TinyDB(DB_FILENAME)
    result = db.get(eid=eid)
    db.update({'seen': True}, eids=[eid])
    db.close()
    return redirect(result['url'], code=302)


if __name__ == '__main__':
    app.run(debug=True)
