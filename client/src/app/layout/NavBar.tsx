import { Group, Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  MenuItem,
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { NavLink } from "react-router";
import MenuItemLink from "../shared/component/MenuItemLink";
import { useStore } from "../../lib/hooks/useStore";
import { Observer } from "mobx-react-lite";
import { useAccount } from "../../lib/hooks/useAccount";
import UserMenu from "./UserMenu"; 
import { useState } from "react";

export default function NavBar() {
  const { uiStore } = useStore();
  const { currentUser } = useAccount();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Menu links
  const menuLinks = [
    { label: "Activities", to: "/activities" },
    { label: "Counter", to: "/counter" },
    { label: "Error", to: "/errors" },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <List>
        {menuLinks.map((link) => (
          <ListItem key={link.to} disablePadding>
            <ListItemButton component={NavLink} to={link.to}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}

        <Box sx={{ mt: 2, pl: 2 }}>
          {currentUser ? (
            <UserMenu />
          ) : (
            <>
              <MenuItemLink to="/login">Login</MenuItemLink>
              <MenuItemLink to="/register">Register</MenuItemLink>
            </>
          )}
        </Box>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

            {/* Brand / Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <MenuItem component={NavLink} to="/" sx={{ display: "flex", gap: 1 }}>
                <Group fontSize="large" />
                <Typography sx={{ position: "relative" }} variant="h5" fontWeight="bold">
                  RabLinkin
                </Typography>

                <Observer>
                  {() =>
                    uiStore.isLoading ? (
                      <CircularProgress
                        size={20}
                        thickness={7}
                        sx={{
                          color: "white",
                          position: "absolute",
                          top: "30%",
                          left: "105%",
                        }}
                      />
                    ) : null
                  }
                </Observer>
              </MenuItem>
            </Box>

            {/* Desktop Menu */}
            {!isMobile && (
              <Box sx={{ display: "flex" }}>
                {menuLinks.map((link) => (
                  <MenuItemLink key={link.to} to={link.to}>
                    {link.label}
                  </MenuItemLink>
                ))}
              </Box>
            )}

            {/* User Section (Desktop) */}
            {!isMobile && (
              <Box display="flex" alignItems="center">
                {currentUser ? (
                  <UserMenu />
                ) : (
                  <>
                    <MenuItemLink to="/login">Login</MenuItemLink>
                    <MenuItemLink to="/register">Register</MenuItemLink>
                  </>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton color="inherit" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer for Mobile */}
      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </Box>
  );
}
