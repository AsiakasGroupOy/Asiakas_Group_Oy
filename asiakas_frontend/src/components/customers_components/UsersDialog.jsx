import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";

export default function UserDialog({
  open,
  onClose,
  selectedCustomer,
  userList,
  handleUpdateUserRole,
  handleUserRemove,
}) {
  const roles = ["Manager", "User", "Admin Access"];
  const [editableUsers, setEditableUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (open) {
      setEditableUsers(userList.map((u) => ({ ...u })));
      setEditingId(null);
    }
  }, [open, userList]);

  const startEdit = (userId) => {
    setEditingId(userId);
  };

  const updateField = (index, field, value) => {
    setEditableUsers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const saveRow = async (index) => {
    const user = editableUsers[index];
    await handleUpdateUserRole(user);
    setEditingId(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Users of {selectedCustomer}</DialogTitle>

      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#adc4e7ff" }}>
              <TableCell sx={{ fontWeight: "bold" }}>User Id</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>User name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Created At</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {editableUsers.map((u, index) => {
              const isEditing = editingId === u.user_id;
              return (
                <TableRow
                  key={u.user_id}
                  hover
                  onClick={() => !isEditing && startEdit(u.user_id)}
                  sx={{
                    backgroundColor: isEditing ? "#f0f8ff" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  <TableCell style={{ width: "10%" }}>{u.user_id}</TableCell>
                  <TableCell style={{ width: "20%", padding: "10px" }}>
                    {u.username}
                  </TableCell>
                  <TableCell style={{ width: "50%", padding: "10px" }}>
                    {u.useremail}
                  </TableCell>

                  <TableCell>
                    <Select
                      size="small"
                      value={roles.includes(u.role) ? u.role : ""}
                      onChange={(e) =>
                        isEditing
                          ? updateField(index, "role", e.target.value)
                          : null
                      }
                      disabled={!isEditing}
                    >
                      {roles.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell style={{ width: "10%" }}>
                    {new Date(u.created_at).toLocaleDateString("fi-FI")}
                  </TableCell>
                  <TableCell align="right" style={{ width: "11%" }}>
                    {isEditing && (
                      <IconButton onClick={() => saveRow(index)}>
                        <SaveIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleUserRemove(u)}>
                      <DeleteIcon sx={{ color: "red" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {editableUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
