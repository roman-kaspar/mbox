# mbox

The project I used for tracking my bank account ([smoneybox.com](https://smoneybox.com/)) was closed on May 1, 2022. So I either migrate my data to similar on-line service, or create a tool that I can run locally and that offers features I care about the most:
* import of CSV transaction files (created with [jtbanka2mbox](https://github.com/roman-kaspar/jtbanka2mbox) tool)
* the overall balance for the whole bank account (since the account beginning, or for provided period)
* the per-category balances (since the account beginning, or for provided period)
* list of transactions (overall + per-category; last N + provided priod + all)
* export of transactions into a CSV file

### Tech

The plan is to create a command-line tool that works with local SQL database, and simple command-line query client that will handle the above requirements. I want to use TypeScript and SQLite3.

### Data formats

The import / export **CSV files** are of the following format:
* Date: _string_, date in "YYYY-MM-DD" format, e.g. "2022-05-01"
* Category: _string_
* Amount: _string_, in fixed two decimal digits format, e.g. "5679.73"

Exported files contain only listed columns, imported files must contain at least the above columns, all other column are ignored.

The **DB schema** is tracked in `migrations` directory, the schema contains the following tables:
* categories: (id, name)
* transactions: (id, category_id, date, amount)

All _ids_ are generated + autoincremented, the _name_ and _date_ are of TEXT type, and _amounts_ are of INTEGER type.

### Building

To build the project, you run
```
$ yarn
$ yarn build
```

Compiled scripts are in `dist` directory, you need node version 16 or newer to run the code, to start it run
```
$ ./bin/mbox
```
with the arguments needed (see below).

### Supported commands

The following commands are supported:
* help
* init_db
* import
* balance
* list
* export

For details, use `help` command.

### Ideas / TODO

* `--since <date>` filter for `balance` and `list` commands

### Copyright

MIT License

Copyright (c) 2022--2026 Roman Kaspar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
