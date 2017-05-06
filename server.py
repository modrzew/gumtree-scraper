from flask import (
    Flask,
    json,
    redirect,
    render_template,
    url_for,
)
from tinydb import TinyDB, Query


# Configurables
DB_FILENAME = '.db'

app = Flask(__name__)


@app.route('/')
def main():
    return render_template('list.html')


@app.route('/api')
def api():
    db = TinyDB(DB_FILENAME)
    results = db.search((Query().hidden == False) | (Query().starred == True))
    db.close()
    for result in results:
        result['eid'] = result.eid
        result['url'] = url_for('goto', eid=result.eid)
    results.sort(key=lambda r: r['created_at'], reverse=True)
    return json.dumps(results)


@app.route('/goto/<int:eid>')
def goto(eid):
    db = TinyDB(DB_FILENAME)
    result = db.get(eid=eid)
    db.update({'seen': True}, eids=[eid])
    return redirect(result['url'], code=302)


@app.route('/star/<int:eid>', methods=['POST'])
def star(eid):
    db = TinyDB(DB_FILENAME)
    result = db.get(eid=eid)
    db.update({'starred': not result['starred']}, eids=[eid])
    db.close()
    return 'OK'


@app.route('/hide/all', methods=['POST'])
def hide_all():
    db = TinyDB(DB_FILENAME)
    eids = [
        r.eid for r in db.search(
            (Query().hidden == False) & (Query().starred == False)
        )
    ]
    db.update({'hidden': True}, eids=eids)
    db.close()
    return 'OK'


@app.route('/show/all', methods=['GET', 'POST'])
def show_all():
    db = TinyDB(DB_FILENAME)
    eids = [
        r.eid for r in db.search(
            (Query().hidden == True)
        )
    ]
    db.update({'hidden': False}, eids=eids)
    db.close()
    return 'OK'


@app.route('/hide/<int:eid>', methods=['POST'])
def hide(eid):
    db = TinyDB(DB_FILENAME)
    result = db.get(eid=eid)
    db.update({'hidden': not result['hidden']}, eids=[eid])
    db.close()
    return 'OK'


if __name__ == '__main__':
    app.run(debug=True)
