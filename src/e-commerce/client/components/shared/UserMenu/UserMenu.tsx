import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import * as React from "react";
import { useState } from "react";
import { Z_INDEX_ACCOUNT_MENU } from "../../constants";

interface AccountMenuProps {
  isLoggedIn: boolean;
  session: any;
  onLoginLogout: () => void;
  onSignUp: () => void;
}

export default function AccountMenu({ isLoggedIn, session, onLoginLogout, onSignUp }: AccountMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="account-menu" style={{ zIndex: Z_INDEX_ACCOUNT_MENU }}>
      <>
        <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }} src={session?.user?.user_metadata.avatar_url || ""}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0
                }
              }
            }
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={onLoginLogout}>
            <ListItemIcon>{isLoggedIn ? <Logout fontSize="small" /> : <PersonAdd fontSize="small" />}</ListItemIcon>
            {isLoggedIn ? "Logout" : "Login"}
          </MenuItem>
          <MenuItem onClick={onSignUp}>
            <ListItemIcon>
              <AssignmentIndIcon fontSize="small" />
            </ListItemIcon>
            Sign Up
          </MenuItem>
        </Menu>
      </>
    </div>
  );
}
