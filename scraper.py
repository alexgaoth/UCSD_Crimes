import requests
import os
import time
import schedule
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options

def download_newest_pdf(output_dir="ucsd_police_reports"):
    base_url = "https://www.police.ucsd.edu/docs/reports/callsandarrests/Calls_and_Arrests.asp"
    
    os.makedirs(output_dir, exist_ok=True)
    
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(base_url)
        time.sleep(2)
        
        select = Select(driver.find_element(By.TAG_NAME, "select"))
        options = select.options
        
        for idx, option in enumerate(options):
            text = option.text.strip()
            if not text or "Select" in text:
                continue
            
            filename = text if text.endswith('.pdf') else f"{text}.pdf"
            filepath = os.path.join(output_dir, filename)
            
            if os.path.exists(filepath):
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Latest PDF already exists: {filename}")
                return
            
            try:
                select.select_by_index(idx)
                time.sleep(1)
                
                pdf_url = None
                pdf_links = driver.find_elements(By.XPATH, "//a[contains(@href, '.pdf')]")
                
                if pdf_links:
                    pdf_url = pdf_links[0].get_attribute('href')
                elif driver.current_url.endswith('.pdf'):
                    pdf_url = driver.current_url
                
                if pdf_url:
                    response = requests.get(pdf_url, timeout=30)
                    response.raise_for_status()
                    
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Downloaded newest PDF: {filename}")
                    return
                
            except Exception as e:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Failed to download {filename}: {e}")
                return
        
    finally:
        driver.quit()

def download_ucsd_police_pdfs(output_dir="ucsd_police_reports"):
    base_url = "https://www.police.ucsd.edu/docs/reports/callsandarrests/Calls_and_Arrests.asp"
    
    os.makedirs(output_dir, exist_ok=True)
    
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(base_url)
        time.sleep(2)
        
        select = Select(driver.find_element(By.TAG_NAME, "select"))
        options = select.options
        
        stats = {"downloaded": 0, "skipped": 0, "failed": 0}
        
        for idx, option in enumerate(options):
            text = option.text.strip()
            if not text or "Select" in text:
                continue
            
            filename = text if text.endswith('.pdf') else f"{text}.pdf"
            filepath = os.path.join(output_dir, filename)
            
            if os.path.exists(filepath):
                stats["skipped"] += 1
                print(f"[{idx}/{len(options)}] SKIP {filename}")
                continue
            
            try:
                select.select_by_index(idx)
                time.sleep(1)
                
                pdf_url = None
                pdf_links = driver.find_elements(By.XPATH, "//a[contains(@href, '.pdf')]")
                
                if pdf_links:
                    pdf_url = pdf_links[0].get_attribute('href')
                elif driver.current_url.endswith('.pdf'):
                    pdf_url = driver.current_url
                
                if pdf_url:
                    response = requests.get(pdf_url, timeout=30)
                    response.raise_for_status()
                    
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    
                    stats["downloaded"] += 1
                    print(f"[{idx}/{len(options)}] SAVE {filename}")
                    
                    if driver.current_url.endswith('.pdf'):
                        driver.back()
                        time.sleep(1)
                else:
                    stats["failed"] += 1
                    print(f"[{idx}/{len(options)}] FAIL {filename}")
                
                time.sleep(0.5)
                
            except Exception as e:
                stats["failed"] += 1
                print(f"[{idx}/{len(options)}] ERROR {filename}: {e}")
        
        print(f"\nCompleted: {stats['downloaded']} downloaded, {stats['skipped']} skipped, {stats['failed']} failed")
        print(f"Output: {os.path.abspath(output_dir)}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    download_ucsd_police_pdfs()
    #download_newest_pdf()