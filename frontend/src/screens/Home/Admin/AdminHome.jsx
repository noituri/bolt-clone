import { useEffect } from "react";
import { useState } from "react";
import "./AdminHome.css";
import { useAuth } from "../../../hooks/useAuth";
import { dateFormatter } from "../../../utils";
import { sendGetAllUsersRequest } from "../../../api/admin";
import { useNavigate } from "react-router";

function AdminHome() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    sendGetAllUsersRequest(user).then(setUsers)
  }, [user]);

  const userList = users.map((entry) => <UserEntry key={entry.id} entry={entry} />);

  return (
    <>
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
  const navigate = useNavigate();
  return (
    <tr className="user-list-entry" onClick={() => navigate(`/admin/user/${entry.id}`)}>
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

export default AdminHome;
