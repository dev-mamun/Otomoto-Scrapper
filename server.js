/**
 * Created by Md.Abdullah Al Mamun.
 * Email: mamun1214@gmail.com
 * Date: 11/5/2021
 * Time: 8:53 AM
 * Year: 2021
 */

const http = require('http'); // built-in http module
const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const { title } = require('process');
const fs = require("fs");

//const { response } = require('express');

const app = express();
const PORT = 3000;

const baseUrl = "https://www.otomoto.pl";
const otomotoUrl = baseUrl + "/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at %3Adesc";

/**
 * @description Create server, it will takes an argument as req & res.
 * @param req, res
 */
// var server = http.createServer(function(req, res){
//     res.writeHead(200, {"Content-type":"text/plain"});
// });

// //Listen for web request on port #3000
// server.listen(PORT, function(){
//     console.log("Server is running on : ", PORT);
// });

app.get('/', function (req, res) {
    res.status(200).send('Hello World!!!');
});

app.get('/title', function (req, res) {
    scrapeTitle();
    res.status(200).send("Successfully written data to file");
});

app.get('/pages', function (req, res) {
    getNextPageUrl();
    res.status(200).send("Successfully written data to file");
});

async function scrapeTitle() {
    try {
        const { data } = await axios.get(otomotoUrl);
        const $ = cheerio.load(data);
        console.info($('title').text());
        const title = { title: $('title').text() }
        fs.writeFileSync('title.json', JSON.stringify(title), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Successfully written data to file");
            return;
        });
    } catch (error) {
        console.error(error);
    }
};

async function getNextPageUrl() {
    try {
        const { data } = await axios.get(otomotoUrl);
        const $ = cheerio.load(data);
        const listItems = $("li.pagination-item");
        const items = [];
        listItems.each((idx, el) => {
            console.debug($(el).attr('title'))
            const item = {};
            if ($(el).attr('data-testid') == "pagination-list-item") {
                if ($(el).attr('aria-label') != "Page 1") {
                    console.debug($(el).html())
                    item.url = $(el).find('a').attr('href');
                    items.push(item);
                }
            }
        });
        console.table(items);
        fs.writeFileSync('pages.json', JSON.stringify(items), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Successfully written data to file");
            return;
        });
    } catch (error) {
        console.error(error);
    }
};

async function addItems() {
    try {
        const { data } = await axios.get(otomotoUrl);
        const $ = cheerio.load(data);
        const listItems = $(".optimus-app-p2z5vl article");
        const items = [];

        listItems.each((idx, el) => {
            const item = { id: '', url: '' };
            item.id = $(el).attr('id');
            item.url = $(el).find('img').attr('src');
            items.push(item);
        });
        // Logs items array to the console
        console.dir(items);
        // fs.writeFileSync('items.json', JSON.stringify(items), (err) => {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }
        //     console.log("Successfully written data to file");
        //     return;
        // });
    } catch (error) {
        console.error(error);
    }
}

async function getTotalAdsCount() {
    try {
        const { data } = await axios.get(otomotoUrl);
        const $ = cheerio.load(data);
        const listItems = $(".e1mgg0420 a");
        const items = [];
        listItems.each((idx, el) => {
            const item = {};
            if ($(el).attr('data-testid') == 'select-total') {
                console.debug($(el).text().replace(/[^\d]/g, ""));
                item.total = $(el).text().replace(/[^\d]/g, "");
                items.push(item);
            }
        });
        console.dir(items);
    } catch (error) {
        console.error(error);
    }
};

async function scrapeTruckItem() {
    try {
        const { data } = await axios.get(otomotoUrl);
        const $ = cheerio.load(data);
        const listItems = $(".optimus-app-p2z5vl article");
        const items = [];
        listItems.each((idx, el) => {
            const item = {id:'', title:'', price:'', registration_date:'', mileage:'', power:''};
            item.id = $(el).attr('id');
            item.title = $(el).find('h2').text();
            item.price = $(el).find('div.optimus-app-n2xmvo-Text').text();
            item.registration_date = $(el).find('ul li:nth-child(1)').text();
            item.mileage = $(el).find('ul > li:nth-child(2)').text();
            item.power = $(el).find('ul li:nth-child(3)').text();
            item.url = $(el).find('img').attr('src');
            items.push(item);
        });
        console.debug(items);
        fs.writeFileSync('items.json', JSON.stringify(items), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Successfully written data to file");
            return;
        });
    } catch (error) {
        console.error(error);
    }
};

//addItems();
//getNextPageUrl();
//getTotalAdsCount();
scrapeTruckItem();

//Listen for web request on port #3000
app.listen(PORT, function () {
    console.log("app listening at http://localhost:", PORT);
});




