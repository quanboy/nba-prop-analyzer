from flask import Flask, jsonify, request
from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog

app = Flask(__name__)

@app.route('/gamelog')
def get_game_log():
    player_name = request.args.get('player')
    lookback = int(request.args.get('lookback', 10))

    # 1. Find player by name
    matched_players = players.find_players_by_full_name(player_name)
    if not matched_players:
        return jsonify({'error': 'Player not found'}), 404

    player_id = matched_players[0]['id']

    # 2. Fetch game log
    gamelog = playergamelog.PlayerGameLog(
        player_id=player_id,
        season='2025-26'
    )

    games = gamelog.get_normalized_dict()['PlayerGameLog']
    games = games[:lookback]

    return jsonify({
        'player_id': player_id,
        'games': games
    })

if __name__ == '__main__':
    app.run(port=5000)