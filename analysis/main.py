import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py [scrape|trend|score|complete]")
        sys.exit(1)

    task = sys.argv[1].lower()

    if task == "scrape":
        print("Running job scraping...")
        import scrape_jobs
        scrape_jobs.main()
    elif task == "trend":
        print("Running job forecasting...")
        import trend_forecast
        trend_forecast.main()
    elif task == "score":
        print("Running trend scoring...")
        import trend_score
        trend_score.main()
    elif task == "complete":
        print("Running data complete...")
        import data_complete
        data_complete.main()
    else:
        print(f"Invalid task: {task}")
        print("Available: scrape / trend / score / complete")

if __name__ == "__main__":
    main()
