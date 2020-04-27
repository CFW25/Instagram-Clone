let express = require("express");
let graphqlHTTP = require("express-graphql");
let { buildSchema } = require("graphql");
let cors = require("cors");
let Pusher = require("pusher");
let bodyParser = require("body-parser");
let Multipart = require("connect-multiparty");

// Construct a schema, using GraphQL schema language
let schema = buildSchema(`
  type User {
    id : String!
    nickname : String!
    avatar : String!
  }

  type Post {
      id: String!
      user: User!
      caption : String!
      image : String!
  }

  type Query{
    user(id: String) : User!
    post(user_id: String, post_id: String) : Post!
    posts(user_id: String) : [Post]
  }
`);

// Maps id to User object
let userslist = {
  a: {
    id: "a",
    nickname: "Craig",
    avatar: "https://cdn.iconscout.com/icon/free/png-512/avatar-380-456332.png"
  },
  b: {
    id: "b",
    nickname: "Bob",
    avatar:
      "http://res.cloudinary.com/og-tech/image/upload/q_40/v1506850315/contact_tzltnn.jpg"
  }
};

let postslist = {
  a: {
    a: {
      id: "a",
      user: userslist["a"],
      caption: "Stay Home, Save Lives!",
      image: "https://cdn.pixabay.com/photo/2020/04/22/10/29/call-5077271__340.jpg"
    },
    b: {
      id: "b",
      user: userslist["a"],
      caption: "Grand central terminal :)",
      image:
        "https://cdn.pixabay.com/photo/2020/04/22/05/25/grand-central-terminal-5075970__340.jpg"
    },
    c: {
      id: "c",
      user: userslist["a"],
      caption: "Look at this cool photo I took",
      image: "https://cdn.pixabay.com/photo/2020/01/17/16/01/tree-4773295_1280.jpg"
    },
    d: {
      id: "d",
      user: userslist["a"],
      caption: "New Laptop!",
      image: "https://cdn.pixabay.com/photo/2014/05/02/21/49/home-office-336373__340.jpg"
    },
    e: {
      id: "e",
      user: userslist["a"],
      caption: "New Laptop!",
      image: "https://cdn.pixabay.com/photo/2016/02/19/10/00/laptop-1209008_1280.jpg"
    }
  }
};

// The root provides a resolver function for each API endpoint
let root = {
  user: function({ id }) {
    return userslist[id];
  },
  post: function({ user_id, post_id }) {
    return postslist[user_id][post_id];
  },
  posts: function({ user_id }) {
    return Object.values(postslist[user_id]);
  }
};

// Configure Pusher client
let pusher = new Pusher({

});

// create express app
let app = express();
app.use(cors());
app.use(bodyParser.json());

let multipartMiddleware = new Multipart();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

// trigger add a new post 
app.post('/newpost', multipartMiddleware, (req,res) => {
  // create a sample post
  let post = {
    user : {
      nickname : req.body.name,
      avatar : req.body.avatar
    },
    image : req.body.image,
    caption : req.body.caption
  }
  
  // trigger pusher event 
  pusher.trigger("posts-channel", "new-post", { 
    post 
  });

  return res.json({status : "Post created"});
});


app.listen(4000);
console.log("Running a GraphQL API server at localhost:4000/graphql");
