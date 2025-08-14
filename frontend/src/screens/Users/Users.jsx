import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/Navbar";
import "./Users.css";
import { sendGetAllUsersRequest } from "../../api/admin";
import { useState } from "react";
import { dateFormatter } from "../../utils";

function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    document.title = "Users";
    sendGetAllUsersRequest(user).then(setUsers)
  }, [user]);

  console.log(users);
  const userList = users.map((entry) => <UserEntry entry={entry} />);

  return (
    <>
      <Navbar active="Users" />
      <h2>Users</h2>
      <table className="user-list">
        <thead>
          <tr className="user-list-entry">
            <th>ID</th>
            <th>User name</th>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Creation Date</th>
            <th>Is Active?</th>
          </tr>
        </thead>
        <tbody>{userList}</tbody>
      </table>
    </>
  );
}

function UserEntry({ entry }) {
  return (
    <tr className="user-list-entry">
      <td>
        {entry.id}
      </td>
      <td>
        {entry.username}
      </td>
      <td>
        {entry.full_name}
      </td>
      <td>
        {entry.phone}
      </td>
      <td>
        {entry.role}
      </td>
      <td>
        {dateFormatter.format(new Date(entry.created_at))}
      </td>
      <td>
        {entry.is_active ? "Yes" : "No"}
      </td>
    </tr>
  );
}

export default Users;
