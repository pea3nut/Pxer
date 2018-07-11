import selenium.webdriver
import http.client as httpconn
import re
import urllib
import bs4
import os
import sys
import time
import json

TEST_COUNT = 19
HERE = os.path.dirname(os.path.abspath(__file__))
HAVE_FAIL = False


def login(username, password):
    host = "accounts.pixiv.net"
    conn = httpconn.HTTPSConnection(host)
    conn.request(
        "GET",
        "/login?lang=en&source=pc&view_type=page&ref=wwwtop_accounts_index")
    res = conn.getresponse()
    login_cookie = res.getheader("set-cookie")
    post_key = bs4.BeautifulSoup(res.read(), "html5lib").find(
        "input", attrs={"name": "post_key"})['value']
    login_sess_id = re.search(r"(?<=PHPSESSID=)(\w)*(?=;)",
                              login_cookie).group(0)

    params = urllib.parse.urlencode({
        "pixiv_id": username,
        "captcha": "",
        "g_recaptcha_response": "",
        "password": password,
        "post_key": post_key,
        "lang": "en",
        "source": "accounts",
        "ref": "",
        "return_to": "https://www.pixiv.net",
    })

    conn.request(
        "POST",
        "/api/login?lang=en",
        body=params,
        headers={
            "origin":
            "https://accounts.pixiv.net",
            "referer":
            "https://accounts.pixiv.net/login?lang=en&source=pc&view_type=page&ref=wwwtop_accounts_index",
            "content-type":
            "application/x-www-form-urlencoded",
            "accept":
            "application/json",
            "cookie":
            "show_welcome_modal=1; p_ab_id=7; p_ab_id_2=9; login_bc=1; PHPSESSID="
            + login_sess_id,
            "user-agent":
            "Mozilla/5.0"
        })
    res = conn.getresponse()
    result = json.loads(res.read())
    if result['error'] or ("success" not in result['body']):
        print("login fail:" + str(result))
        raise ValueError
    return re.search(r"(?<=PHPSESSID=)[\w_]*(?=;)",
                     res.getheader("set-cookie")).group(0)


def print_stat(elem):
    for failitem in elem.find_elements_by_class_name("fail"):
        print("Failed:" + failitem.find_element_by_tag_name("h2").text.strip())


def test(browser="chrome", sessid=None):
    global HAVE_FAIL
    if browser == "chrome":
        options = selenium.webdriver.ChromeOptions()
        options.add_argument("disable-web-security")
        if sys.platform == "win32":
            options.add_argument("user-data-dir=D:\\temp-profile")
            driver = selenium.webdriver.Chrome(
                "d:\chromedriver.exe", options=options)
        else:
            options.add_argument("user-data-dir=/tmp/chrome")
            options.add_argument("disable-dev-shm-usage")
            options.add_argument("headless")
            options.add_argument("no-sandbox")
            driver = selenium.webdriver.Chrome(options=options)
    elif browser == "firefox":
        options = selenium.webdriver.FirefoxProfile()
        driver = selenium.webdriver.Firefox(firefox_profile=options)
        driver.install_addon(HERE + "/cors.xpi")

    driver.get("https://www.pixiv.net")
    time.sleep(3) # wait for enough time to load a context for cookie
    driver.add_cookie({
        'name': 'PHPSESSID',
        'value': sessid,
        'path': '/',
        'secure': True,
        'domain': '.pixiv.net'
    })
    while not driver.get_cookie('PHPSESSID'):
        time.sleep(2)

    driver.get("file://" + HERE + "/index.html")

    while True:
        num_pass = int(
            driver.find_element_by_class_name("passes")
            .find_element_by_tag_name("em").text)
        num_fail = int(
            driver.find_element_by_class_name("failures")
            .find_element_by_tag_name("em").text)
        if num_fail + num_pass == TEST_COUNT:
            break
        else:
            print("{} success {} fail".format(num_pass, num_fail))
            time.sleep(3)
    print_stat(driver.find_element_by_id("mocha-report"))
    if num_fail != 0:
        print("{} tests failed.".format(num_fail))
        HAVE_FAIL = True


if __name__ == "__main__":
    if sys.platform=="win32":
        sessid = login(sys.argv[1], sys.argv[2])
    else:
        sessid = login(os.getenv("PX_USER"), os.getenv("PX_PASS"))
    print("==========================Chrome==========================")
    test(browser="chrome", sessid=sessid)
    print("==========================Firefox==========================")
    test(browser="firefox", sessid=sessid)
    if HAVE_FAIL:
        raise RuntimeError("Test failed.")
