from flask import Flask, jsonify, request
from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog, commonplayerinfo

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
    full_name = matched_players[0]['full_name']

    # 2. Fetch player info (position, jersey number, team, etc.) if needed
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    player_info = info.get_normalized_dict()['CommonPlayerInfo'][0]

    position = player_info['POSITION']
    jersey_number = player_info['JERSEY']
    team_name = player_info['TEAM_NAME']
    team_abbreviation = player_info['TEAM_ABBREVIATION']
    jersey_number = player_info['JERSEY']

    # 3. NBA CDN headshot URL
    headshot_url = f"https://cdn.nba.com/headshots/nba/latest/1040x760/{player_id}.png"

    # 3. Fetch game log
    gamelog = playergamelog.PlayerGameLog(
        player_id=player_id,
        season='2025-26'
    )

    games = gamelog.get_normalized_dict()['PlayerGameLog']
    games = games[:lookback]

    return jsonify({
    'player_id': player_id,
    'full_name': full_name,
    'games': games,
    'position': position,
    'jersey_number': jersey_number,
    'team_name': team_name,
    'team_abbreviation': team_abbreviation,
    'headshot_url': headshot_url
})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)