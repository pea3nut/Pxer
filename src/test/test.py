import selenium.webdriver
import os
import sys
import time

TEST_COUNT = 19
HERE = os.path.dirname(os.path.abspath(__file__))
HAVE_FAIL = False


def print_stat(elem):
    for failitem in elem.find_elements_by_class_name("fail"):
        print("Failed:" + failitem.find_element_by_tag_name("h2").text.strip())


def test(browser="chrome"):
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
        options.add_extension("/tmp/cors.xpi")
        driver = selenium.webdriver.Firefox(firefox_profile=options)

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
    print("==========================Chrome==========================")
    test(browser="chrome")
    print("==========================Firefox==========================")
    test(browser="firefox")
    if HAVE_FAIL:
        raise RuntimeError("Test failed.")
