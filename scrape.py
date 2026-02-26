import requests
from bs4 import BeautifulSoup
import json
import time

BASE = "https://www.boatrace.jp"

def get_all_racers():
    url = f"{BASE}/owpc/pc/data/racersearch/search"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    racers = []
    for row in soup.select(".is-pc-table tbody tr"):
        cols = row.select("td")
        if len(cols) < 4:
            continue
        toban = cols[0].text.strip()
        name = cols[1].text.strip()
        branch = cols[2].text.strip()
        grade = cols[3].text.strip()
        racers.append((toban, name, branch, grade))
    return racers

def get_recent_races(toban):
    url = f"{BASE}/owpc/pc/data/racersearch/profile?toban={toban}"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    links = []
    for a in soup.select("a[href*='raceresult']"):
        links.append(BASE + a["href"])
    return links[:120]  # 多めに取っておく

def get_race_result(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    try:
        wakuban = int(soup.select_one(".table1 tbody tr td").text.strip())
        chakujun = soup.select_one(".table1 tbody tr td:nth-child(3)").text.strip()
        if chakujun.isdigit():
            chakujun = int(chakujun)
        else:
            chakujun = 6
        score = max(1, 10 - chakujun + 1)
        return wakuban, score
    except:
        return None, None

def main():
    racers = get_all_racers()
    output = {}

    for toban, name, branch, grade in racers:
        boat = {1:[],2:[],3:[],4:[],5:[],6:[]}

        urls = get_recent_races(toban)

        for u in urls:
            wakuban, score = get_race_result(u)
            if wakuban and score:
                boat[wakuban].append(score)
            time.sleep(0.3)

        output[toban] = {
            "name": name,
            "branch": branch,
            "class": grade,
            "boat1": boat[1],
            "boat2": boat[2],
            "boat3": boat[3],
            "boat4": boat[4],
            "boat5": boat[5],
            "boat6": boat[6]
        }

    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
