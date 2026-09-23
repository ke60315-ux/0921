"""
AI 創新微課程 - Taiwan Weather Forecast (資料庫初始化工具)
-------------------------------------------------------------
功能：
  即使在完全離線環境下，也能一鍵建立標準 SQLite 資料庫 (data.db)，
  並填入微課程圖解中所展示的標準一週氣溫資料，供 Streamlit Web App (app.py) 立即展示！
"""

import sqlite3
import datetime

DB_FILE = "data.db"
TABLE_NAME = "TemperatureForecasts"

def init_database():
    print(f"正在初始化 SQLite 資料庫 [{DB_FILE}]...")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # 建立符合步驟 9 的資料表結構
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        regionName TEXT NOT NULL,
        dataDate TEXT NOT NULL,
        minT REAL NOT NULL,
        maxT REAL NOT NULL,
        UNIQUE(regionName, dataDate)
    );
    """)

    # 建立基準日期（以今日起算 7 天，同時包含課程圖解對應的日期格式）
    today = datetime.date.today()
    dates = [(today + datetime.timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

    # 6 大分區一週氣溫資料 (與課程圖解完全一致之數值曲線)
    region_data = {
        "北部地區": [
            (dates[0], 18.0, 26.0),
            (dates[1], 19.5, 27.0),
            (dates[2], 18.5, 25.5),
            (dates[3], 20.0, 28.0),
            (dates[4], 17.0, 24.0),
            (dates[5], 18.0, 26.5),
            (dates[6], 19.0, 27.5)
        ],
        "中部地區": [
            (dates[0], 20.0, 30.0),
            (dates[1], 21.0, 31.0),
            (dates[2], 22.0, 32.0),
            (dates[3], 21.0, 30.0),
            (dates[4], 20.0, 29.0),
            (dates[5], 19.5, 28.5),
            (dates[6], 21.0, 30.5)
        ],
        "南部地區": [
            (dates[0], 22.0, 31.0),
            (dates[1], 23.0, 32.5),
            (dates[2], 23.5, 33.0),
            (dates[3], 24.0, 33.5),
            (dates[4], 22.5, 31.5),
            (dates[5], 22.0, 31.0),
            (dates[6], 23.0, 32.0)
        ],
        "東北部地區": [
            (dates[0], 17.5, 25.0),
            (dates[1], 18.5, 26.0),
            (dates[2], 18.0, 24.5),
            (dates[3], 19.0, 25.5),
            (dates[4], 17.0, 23.5),
            (dates[5], 17.5, 24.0),
            (dates[6], 18.5, 25.5)
        ],
        "東部地區": [
            (dates[0], 19.0, 27.0),
            (dates[1], 20.0, 28.0),
            (dates[2], 20.5, 28.5),
            (dates[3], 21.0, 29.0),
            (dates[4], 19.5, 26.5),
            (dates[5], 19.0, 26.0),
            (dates[6], 20.0, 27.5)
        ],
        "東南部地區": [
            (dates[0], 21.0, 29.5),
            (dates[1], 22.0, 30.5),
            (dates[2], 22.5, 31.0),
            (dates[3], 23.0, 31.5),
            (dates[4], 21.5, 29.0),
            (dates[5], 21.0, 29.0),
            (dates[6], 22.0, 30.0)
        ]
    }

    insert_sql = f"""
    INSERT OR REPLACE INTO {TABLE_NAME} (regionName, dataDate, minT, maxT)
    VALUES (?, ?, ?, ?);
    """

    count = 0
    for region, records in region_data.items():
        for d, min_t, max_t in records:
            cursor.execute(insert_sql, (region, d, min_t, max_t))
            count += 1

    conn.commit()

    # 執行步驟 10 的 SQL 檢驗
    print("\n" + "=" * 50)
    print("【SQL 驗證】SELECT DISTINCT regionName FROM TemperatureForecasts:")
    cursor.execute(f"SELECT DISTINCT regionName FROM {TABLE_NAME};")
    print(cursor.fetchall())

    print("\n【SQL 驗證】SELECT * FROM TemperatureForecasts WHERE regionName = '中部地區':")
    cursor.execute(f"SELECT regionName, dataDate, minT, maxT FROM {TABLE_NAME} WHERE regionName = '中部地區';")
    for r in cursor.fetchall():
        print(f"{r[0]} | 日期: {r[1]} | 最低溫: {r[2]}°C | 最高溫: {r[3]}°C")

    conn.close()
    print("=" * 50)
    print(f"✓ 資料庫已成功建立！共寫入 {count} 筆紀錄，檔案位於: {DB_FILE}")

if __name__ == "__main__":
    init_database()
