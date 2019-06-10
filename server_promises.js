// we are making a server in this file
var express = require('express') // imports express into our server
var formidable = require('express-formidable') // imports express-formidable middleware to draw form data out
var app = express() // initialises an instance of the express server called 'app'
var fs = require('fs')
app.use(formidable()) // use express-formidable
app.use(express.static("public")); // serve all static assets from the public folder

/*
   NOTE: This code is not being run by the server, to run it, replace the entire
   contents of server.js with this, or just change your package.json like so:
   {
     ...
     "main": "server-with-promises.js",
     ...
   }
   (Don't forget to restart your server!)
*/


/*
  Instead of this endpoint needing to know about reading and writing files, we
  can move the reading and writing to other functions (ideally, to another
  file). The other reason to do this is because we want to load posts in a
  couple places (the GET and the POST).
  Once `loadPosts` (which calls `fs.readFile`) has completed its work, it will
  return the posts wrapped in a Promise – we can access the posts themselves via
  the Promise's `then` method.
  `.then(function (posts) { res.send(posts) })`
  Using arrow functions this can be made a bit cleaner...
  `.then((posts) => res.send(posts))`
  ...also, if there's only one parameter we can drop the parentheses...
  `.then(posts => res.send(posts))`
  ...actually, since we're declaring a function that is simply directly passing
  the argument it receives to another function, we can cut out the middleman:
  `.then(res.send)`
  Don't forget to add a `catch` to handle any errors (even in tutorial code and
  learning exercises, error handling will help you, the dev, to understand what
  is going on then things don't work.
*/
app.get('/posts', (req, res) => {
  loadPosts()
    .then(res.send)
    .catch(err => console.error(`There was a problem getting posts ${err}`))
})


app.post('/posts', (req, res) => {
  if (!req.fields.blogspot) return res.status(400).send('Missing required field: blogspot')
  const content = req.fields.blogspot

  loadPosts()
    .then(posts => {
      posts[Date.now()] = content
      return JSON.stringify(posts)
    })
    .then(savePosts)
    .then(() => res.sendStatus(200))
    .catch(err => console.error(`There was a problem saving posts: ${err}`))
})

/*
   I wrapped the reading and writing of data in a couple functions so they're
   nicer to use as you can see above.
   If it were me, I'd move these functions to another module, call it
   'database' or something, then import them (and remove the `fs` require) in
   this file.
   NOTE: these are identical to the ones used in `server-with-async-await.js`
 */
function loadPosts() {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/data/posts.json', function (error, file) {
      if (error) reject('Failed to read posts')
      resolve(JSON.parse(file))
    })
  })
}

function savePosts(posts) {
  return new Promise((resolve, reject) => {
    fs.writeFile(__dirname + '/data/posts.json', posts, function (error) {
      if (error) reject('Failed to save posts')
      resolve()
    })
  })
}

app.listen(3000, function () {
  console.log("My server is listening on port 3000. Ready to accept requests!")
})