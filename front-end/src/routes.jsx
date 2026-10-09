import App from "./App"
import WaitingRoom from "./components/WaitingRoom"
import HomePage from "./HomePage"
import ProfilePage from "./ProfilePage"
import Post from "./components/Post"
import Follow from "./Follow"
import SearchPage from "./SearchPage"
import Notifications from "./Notifications"
import Signup from "./Signup"
const routes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth",
    element: <WaitingRoom />,
  },
  {
    path: "home",
    element: <HomePage />,
  },
  {
    path: "/:username",
    element: <ProfilePage />,
  },
  {
    path: "/:username/status/:postId",
    element: <Post />,
  },
  {
    path: "/:username/with_replies",
    element: <ProfilePage />,
  },
  {
    path: "/:username/following",
    element: <Follow />,
  },
  {
    path: "/:username/followers",
    element: <Follow />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]

export default routes
