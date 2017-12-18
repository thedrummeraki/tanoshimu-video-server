# Welcome to Tanoshimu Video Server!
### 楽しむ (lit. To have fun)
<a href="https://tanoshimu.herokuapp.com"><img src="public/favicon.ico" width="100" height="100"/></a>

## What is it?

This is the repository responsible for delivering content to my streaming application [https://tanoshimu.herokuapp.com](https://tanoshimu.herokuapp.com). Check out a live demo 
[here](https://akinyele.herokuapp.com/#tanoshimu) on my website!

## How can I see it?

I don't publish to link to the real video server for privacy and copyright reasons. The best way to see how it works is to clone this repository and run it.

## Technologies

The following technologies made this app into what it is today:
- [Node.js](https://nodejs.org/) (Server-side and API development)
- _and more to come!_

## How do I contribute? How do I use the project?

This is a Node.js application, so you will have to have *node* installed.
Once you have your development environment set up, make sure you have `/videos` created:
```
$ sudo mkdir /videos
$ sudo chowm -R tanoshimu-user:tanoshimu-user /videos
```
Of course, replace `tanoshimu-user` with your real username.

Now you can clone and start the project:
```
$ git clone git@github.com:/thedrummeraki/tanoshimu-video-server.git
$ cd tanoshimu-video-server
$ npm i
$ npm start
```
Once the server is running, you can go to http://localhost:8014. Feel free to play around with `server.js`.

## Some examples

You can reference real video files on your computer (that's what it's for). **By default, this will look for videos under the folder `/videos`.** Example:

You have an anime show name "Fairy Tail" and all its episodes are located within the folder "fairy-tail". All episodes are in "m4a" format. Here are a few examples of endpoints to hit:

1) You want to view `Episode 45`:
```
http://localhost:3000/videos?show=fairy-tail&episode=45&format=m4a&video=true
```

2) You want to view this episode's thumbnail (simply omit the `video` key)
```
http://localhost:3000/videos?show=fairy-tail&episode=45&format=m4a
```

3) You just realized that episode 56 is in mp4 format (you can omit the `format` key as it is in `mp4` by default):
```
http://localhost:3000/videos?show=fairy-tail&episode=56&video=true
```

4) You want to view the show's banner image. It is located under `/videos/icons/fairy_tail_banner.ico`:
```
http://localhost:3000/videos?show_icon=fairy_tail_banner&&format=ico
```

5) This icon may also be `/videos/other_icons/fairy_tail_banner.ico` (notice the `under` key)
```
http://localhost:3000/videos?show_icon=fairy_tail_banner&&format=ico&under=other_icons
```

More endpoints will be added!

## Can I use it for my project?

You there is a license. If you're okay with it, you can use this in your project accordingly.

## About 404 errors in this application

This is (I think) the most interesting thing about this video server. This server returns a 404 image or a 404 video (if `video=true` is specified). Obviously, the actual status returned will be 200. This was made in such a way that there is always something returned by the server.

## About Tanoshimu

This project was originally called *My Akinyele* and was running Rails 4. The UI and the code design 
were terrible so I decided to change everything in January 2017 for the best. A big change was the use of
Slim and the heavy use of Bootstrap (as well as better overall code architecture).

In July 2017, I went from Bootstrap to Materialize CSS. The transition was nothing short of amazing. It's
impresive how fuild the CSS transition and translation was.

Starting October 2017, I started re-visiting a feature I discovered with my [reviews website](https://reviews-akinyele.herokuapp.com):
internal messaging between users. Most apps these days have a messaging feature. I think this feature will become a 
requirement very soon. I want to add this feature because I want users to be able to share and recommend shows to
each other.
