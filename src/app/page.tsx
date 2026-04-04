"use client";
import { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FaceIcon from "@mui/icons-material/Face";
import PaletteIcon from "@mui/icons-material/Palette";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HistoryIcon from "@mui/icons-material/History";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "./ColorModeContext";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon /> },
  { label: "Face Maker", icon: <FaceIcon /> },
  { label: "Templates", icon: <PaletteIcon /> },
  { label: "History", icon: <HistoryIcon /> },
  { label: "Settings", icon: <SettingsIcon /> },
];

const recentProjects = [
  { name: "Portrait Alpha", status: "Complete", progress: 100, color: "success" },
  { name: "Avatar Set B", status: "In Progress", progress: 65, color: "primary" },
  { name: "Style Pack 3", status: "Draft", progress: 20, color: "warning" },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box>
      <Toolbar>
        <FaceIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          WF Facemaker
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map(({ label, icon }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
              selected={activeNav === label}
              onClick={() => setActiveNav(label)}
              sx={{
                borderRadius: 2,
                mx: 1,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "&:hover": { backgroundColor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            {activeNav}
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode} title="Toggle dark mode">
            {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ ml: 1 }}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar — mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Sidebar — desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar />

        {/* Stats row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: "Total Faces", value: "128", icon: <FaceIcon fontSize="large" />, color: "#1976d2" },
            { label: "Templates Used", value: "34", icon: <PaletteIcon fontSize="large" />, color: "#9c27b0" },
            { label: "AI Generations", value: "512", icon: <AutoAwesomeIcon fontSize="large" />, color: "#ed6c02" },
            { label: "Uploads", value: "76", icon: <AddPhotoAlternateIcon fontSize="large" />, color: "#2e7d32" },
          ].map(({ label, value, icon, color }) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
              <Card elevation={2}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: color, width: 52, height: 52 }}>{icon}</Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{value}</Typography>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Projects + Quick Actions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Projects
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {recentProjects.map(({ name, status, progress, color }) => (
                  <Box key={name} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body1" fontWeight={500}>{name}</Typography>
                      <Chip
                        label={status}
                        size="small"
                        color={color as "success" | "primary" | "warning"}
                        variant="outlined"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      color={color as "success" | "primary" | "warning"}
                      sx={{ borderRadius: 1, height: 6 }}
                    />
                  </Box>
                ))}
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="outlined" size="small">View All Projects</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Button variant="contained" startIcon={<FaceIcon />} fullWidth>
                    New Face
                  </Button>
                  <Button variant="contained" color="secondary" startIcon={<AddPhotoAlternateIcon />} fullWidth>
                    Upload Photo
                  </Button>
                  <Button variant="outlined" startIcon={<AutoAwesomeIcon />} fullWidth>
                    AI Generate
                  </Button>
                  <Button variant="outlined" color="secondary" startIcon={<PaletteIcon />} fullWidth>
                    Browse Templates
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
