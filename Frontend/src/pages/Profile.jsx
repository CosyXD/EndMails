import { SignOutButton, useUser } from "@clerk/clerk-react";

const Profile = () => {
  const { user } = useUser();

  return (
    <div className="profile-cont">
      <div className="profile">
        <h1>Profile Page</h1>
        <img
          src={user.imageUrl}
          alt="Profile"
          width={200}
          style={{ borderRadius: "50%" }}
        />
        <h2>Welcome, {user.firstName}!</h2>
        <p>
          <strong>Email:</strong> {user.emailAddresses[0].emailAddress}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString()}
        </p>
        <p>
          <strong>Last Sign In:</strong>{" "}
          {new Date(user.lastSignInAt).toLocaleDateString()}
        </p>
        <SignOutButton redirectUrl="/sign-up">
          <button className="logout-btn">Log Out</button>
        </SignOutButton>
      </div>
    </div>
  );
};

export default Profile;
