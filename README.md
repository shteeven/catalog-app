## Synopsis

This Catalog App is the fulfillment of the third project in Udacity's Fullstack Nanodegree. The requirements for which are to build a cataloging application using flask and sqlalchemy as a backend and using html and css (bootstrap) as a front. The app is to take user authentication and keep data safe; allowing only authorized users to perform CRUD operations on data for which they are the creators. This does all that and **more**.

## Explanation

The frontend is powered by AngularJS and interations with the backend are done through json, with authentication being the exception as it uses Flask cookies. All requests for data are done through the `/api/` endpoints which are handled by Angular, and consequently, most pages(partials) are request directly by Angular. For the pages that require rendering, Flask handles the request. 

## API
All unsecured data can be retrieved via JSON.
* All categories -- http://localhost:8000/api/category/
* All items -- http://localhost:8000/api/item/
* Specific category -- http://localhost:8000/api/category/:id
* Specific item -- http://localhost:8000/api/item/:id
An Atoms RSS feed can be reached at `/api/recent.atom`.

## Installation

All depencies for the frontend are either contained within the repo or have links to their CDN. For the backend, you must first install [VirtualBox](https://www.virtualbox.org/), then [Vagrant](https://www.vagrantup.com/). Once these requirements are fulfilled, open terminal. From terminal, `cd` into Catalog Apps directory:
```sh
$ cd /catalog-app-master
```
Run vagrant up and wait for the virtual environment to be installed:
```sh
$ vagrant up
```
SSH into the vagrant environment:
```sh
$ vagrant ssh
```
Once in, cd to host folder:
```sh
$ cd ../../vagrant
```
Then run application.py to start the server:
```sh
$ python application.py
```
After this, the application is ready to use. In your browser, go to `localhost:8000`

## Known issues

There are many, but having the State 'refresh' when a new param is introduced is on the top of my list of fixes. The ability to edit profile info: coming soon.

## Contributors 

Some code has been taken an modified from online tutorials:
Login services courtesy of Gert Hengeveld at [Medium](https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec)
Assistance in writing HTML and css styles provided by [Neven Hadjer](https://github.com/nevenhajder)

