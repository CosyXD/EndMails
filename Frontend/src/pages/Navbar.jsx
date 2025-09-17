import { useUser } from "@clerk/clerk-react";
import MenuIcon from "../assets/icons/Menu.svg";
import SearchIcon from "../assets/icons/Search_alt_fill.svg";
import pfpIcon from "../assets/icons/cosy pfp.png";
import { useNavigate } from "react-router";

const Navbar = () => {
  const user = useUser().user;
  const navigate = useNavigate();
  return (
    <div className="navbar-cont">
      <div
        className="logo-cont"
        onClick={() => {
          navigate("/");
        }}
        style={{ cursor: "pointer" }}
      >
        <img src={MenuIcon} alt="" className="menu-ico" />
        <h1 className="logo">EndMails</h1>
      </div>
      <div
        className="searchbar"
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate("/ask");
        }}
      >
        <img src={SearchIcon} alt="" className="search-ico" />
        <p style={{ marginBottom: "0.2rem" }}>Search Ended Mails</p>
      </div>
      <div
        className="pfp-cont"
        onClick={() => {
          navigate("/profile");
        }}
        style={{ cursor: "pointer" }}
      >
        <p>{user.firstName}</p>
        <img
          src={user.hasImage ? user.imageUrl : pfpIcon}
          alt="pfp"
          className="pfp-ico"
        />
      </div>
    </div>
  );
};

export default Navbar;
