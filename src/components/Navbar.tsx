import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useMLM } from "../context/MLMContext";
import { useWallet } from "../context/WalletContext";
import Logo from "./common/Logo";

interface NavbarProps {
  selectedSection?: string;
  onSectionChange?: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  selectedSection,
  onSectionChange,
}) => {
  // Use only ThirdWeb MLM Context for wallet connections
  const wallet = useWallet();
  const mlm = useMLM();
  const { open } = useWeb3Modal();
  const { open: isModalOpen } = useWeb3ModalState();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Force user existence check when wallet connects and is on correct network
  React.useEffect(() => {
    if (wallet.isConnected && wallet.account && wallet.isCorrectNetwork) {
      console.log(
        "Navbar: Wallet connected on correct network, checking user existence"
      );
      // Add a small delay to ensure context is ready
      const timer = setTimeout(async () => {
        try {
          console.log("Navbar: Triggering user existence check");
          const isRegistered = await mlm.checkMLMRegistration();
          console.log("Navbar: User existence check result:", isRegistered);
        } catch (error) {
          console.error("Navbar: Error checking user existence:", error);
          // Try again after a longer delay
          setTimeout(async () => {
            try {
              console.log("Navbar: Retrying user existence check");
              await mlm.checkMLMRegistration();
            } catch (retryError) {
              console.error("Navbar: Retry failed:", retryError);
            }
          }, 3000);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [wallet.isConnected, wallet.account, wallet.isCorrectNetwork]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (wallet.isConnected && wallet.account && wallet.isCorrectNetwork) {
      try {
        console.log("Navbar: Manual refresh triggered");
        await mlm.checkMLMRegistration();
      } catch (error) {
        console.error("Navbar: Manual refresh failed:", error);
      }
    }
  };

  // Remove refresh button from navbar by not rendering it

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if we're in gaming or MLM section
  const isGamingSection = location.pathname.startsWith("/usd/gaming");
  const isMLMSection = location.pathname.startsWith("/usd/mlm");

  // Use Web3Modal for all wallet operations (MLM and Gaming)
  const currentWallet = {
    account: wallet.account,
    isConnected: wallet.isConnected,
    connectWallet: wallet.connectWallet,
    disconnectWallet: wallet.disconnectWallet,
    loading: wallet.loading,
    isRegistered: mlm.isMLMRegistered,
    isCorrectNetwork: wallet.isCorrectNetwork,
    switchToCorrectNetwork: wallet.switchToCorrectNetwork,
  };

  // Gradient background for AppBar - different for MLM and Gaming
  const appBarStyle = {
    background: isMLMSection
      ? "linear-gradient(90deg, #FFA000 0%, #FF8F00 100%)"
      : "linear-gradient(90deg, #6200ea 0%, #3f51b5 100%)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  };

  // Get page title based on current section
  const getPageTitle = () => {
    if (isMLMSection) {
      return "BDC STACK";
    } else if (isGamingSection) {
      return "BDC STACK";
    }
    return "BDC STACK";
  };

  return (
    <>
      <AppBar position="sticky" sx={appBarStyle} elevation={0}>
        <Container maxWidth="lg" sx={{ px: { xs: 0.25, sm: 0.5, md: 1 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 90, sm: 100 } }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                textDecoration: "none",
                color: "white",
                display: "flex",
                alignItems: "center",
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
              }}
            >
              <Logo size="navbar" sx={{ mr: { xs: 0.2, sm: 0.3 } }} />
              <Box
                component="span"
                sx={{
                  ml: { xs: 0.2, sm: 0.3 },
                  display: { xs: "none", sm: "block" },
                }}
              >
                {getPageTitle()}
              </Box>
              {isMobile && (
                <Box component="span" sx={{ ml: 0.2, fontSize: "0.8rem" }}>
                  BDC
                </Box>
              )}
            </Typography>

            {/* Hamburger Menu for Mobile */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Navigation - Show only on desktop */}
            {!isMobile && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/"
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    backgroundColor: isActive("/")
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  }}
                  startIcon={<HomeIcon />}
                >
                  Home
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/my-holding"
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    backgroundColor: isActive("/my-holding")
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  }}
                  startIcon={<AccountBalanceWalletIcon />}
                >
                  My Holding
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/my-team"
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    backgroundColor: isActive("/my-team")
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  }}
                  startIcon={<PeopleIcon />}
                >
                  My Team
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/swap"
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    backgroundColor: isActive("/swap")
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  }}
                  startIcon={<SwapHorizIcon />}
                >
                  Swap
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/rewards"
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    backgroundColor: isActive("/rewards")
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                  }}
                  startIcon={<EmojiEventsIcon />}
                >
                  Rewards
                </Button>

                {currentWallet.isConnected &&
                  !currentWallet.isRegistered &&
                  !mlm.isLoading && (
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/"
                      sx={{
                        borderRadius: "20px",
                        px: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        border: "2px solid #FF8F00",
                      }}
                      startIcon={<PersonAddIcon />}
                    >
                      Register Now
                    </Button>
                  )}
                {currentWallet.isConnected && mlm.isLoading && (
                  <Button
                    color="inherit"
                    disabled
                    sx={{
                      borderRadius: "20px",
                      px: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Checking...
                  </Button>
                )}
              </Box>
            )}

            {/* Wallet Connection */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.3, sm: 0.5, md: 1 },
                ml: { xs: 0.3, sm: 0.5, md: 1 },
              }}
            >
              {currentWallet.isConnected && (
                <>
                  {/* {!currentWallet.isCorrectNetwork && (
                    <Tooltip title="Click to switch to the correct network">
                      <Chip
                        label={isMobile ? "Wrong Net" : "Wrong Network"}
                        color="error"
                        variant="outlined"
                        onClick={currentWallet.switchToCorrectNetwork}
                        clickable
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } },
                          backgroundColor: 'rgba(244, 67, 54, 0.2)',
                          fontSize: { xs: '0.7rem', sm: '0.875rem' }
                        }}
                      />
                    </Tooltip>
                  )} */}
                  {!isMobile && (
                    <Chip
                      avatar={
                        <Avatar
                          sx={{
                            bgcolor: currentWallet.isRegistered
                              ? theme.palette.success.main
                              : theme.palette.grey[500],
                            width: 32,
                            height: 32,
                            fontSize: "0.875rem",
                          }}
                        >
                          U
                        </Avatar>
                      }
                      label={`${currentWallet.account?.substring(
                        0,
                        6
                      )}...${currentWallet.account?.substring(
                        currentWallet.account.length - 4
                      )}`}
                      sx={{
                        borderColor: "white",
                        color: "white",
                        "& .MuiChip-label": { px: 1 },
                        fontSize: "0.875rem",
                      }}
                      variant="outlined"
                    />
                  )}
                </>
              )}

              {currentWallet.isConnected ? (
                <>
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={currentWallet.disconnectWallet}
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      minWidth: "auto",
                    }}
                    startIcon={!isMobile ? <LogoutIcon /> : undefined}
                  >
                    {isMobile ? "Exit" : "Disconnect"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => open()}
                  sx={{
                    backgroundColor: "#FFA000",
                    "&:hover": { backgroundColor: "#FF8F00" },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    minWidth: "auto",
                  }}
                  startIcon={
                    !isMobile ? <AccountBalanceWalletIcon /> : undefined
                  }
                >
                  {isMobile ? "Connect" : "Connect Wallet"}
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            background: isMLMSection
              ? "linear-gradient(180deg, #FFA000 0%, #FF8F00 100%)"
              : "linear-gradient(180deg, #6200ea 0%, #3f51b5 100%)",
            color: "white",
            paddingTop: 2,
          },
          "& .MuiListItemText-root": {
            color: "white",
          },
          "& .MuiTypography-root": {
            color: "white",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, display: "flex", alignItems: "center" }}
          >
            <Logo size="small" sx={{ mr: 1 }} />
            {getPageTitle()}
          </Typography>
          <IconButton onClick={toggleDrawer} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)", mb: 2 }} />

        <List>
          <ListItem
            component={RouterLink}
            to="/"
            onClick={toggleDrawer}
            sx={{
              backgroundColor: isActive("/")
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
              borderRadius: "4px",
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" sx={{ color: "white" }} />
          </ListItem>

          <ListItem
            component={RouterLink}
            to="/my-holding"
            onClick={toggleDrawer}
            sx={{
              backgroundColor: isActive("/my-holding")
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
              borderRadius: "4px",
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <AccountBalanceWalletIcon />
            </ListItemIcon>
            <ListItemText primary="My Holding" sx={{ color: "white" }} />
          </ListItem>

          <ListItem
            component={RouterLink}
            to="/my-team"
            onClick={toggleDrawer}
            sx={{
              backgroundColor: isActive("/my-team")
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
              borderRadius: "4px",
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="My Team" sx={{ color: "white" }} />
          </ListItem>

          <ListItem
            component={RouterLink}
            to="/swap"
            onClick={toggleDrawer}
            sx={{
              backgroundColor: isActive("/swap")
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
              borderRadius: "4px",
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <SwapHorizIcon />
            </ListItemIcon>
            <ListItemText primary="Swap" sx={{ color: "white" }} />
          </ListItem>

          <ListItem
            component={RouterLink}
            to="/rewards"
            onClick={toggleDrawer}
            sx={{
              backgroundColor: isActive("/rewards")
                ? "rgba(255, 255, 255, 0.15)"
                : "transparent",
              borderRadius: "4px",
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
              <EmojiEventsIcon />
            </ListItemIcon>
            <ListItemText primary="Rewards" sx={{ color: "white" }} />
          </ListItem>

          {currentWallet.isConnected &&
            !currentWallet.isRegistered &&
            !mlm.isLoading && (
              <ListItem
                component={RouterLink}
                to="/"
                onClick={toggleDrawer}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "4px",
                  mx: 1,
                  mb: 0.5,
                  border: "1px solid #FF8F00",
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Register Now" sx={{ color: "white" }} />
              </ListItem>
            )}
        </List>

        <Box sx={{ position: "absolute", bottom: 16, width: "100%", px: 2 }}>
          {currentWallet.isConnected ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1, pl: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: currentWallet.isRegistered
                      ? theme.palette.success.main
                      : theme.palette.grey[500],
                    width: 32,
                    height: 32,
                    fontSize: "0.875rem",
                    mr: 1,
                  }}
                >
                  U
                </Avatar>
                <Typography variant="body2" sx={{ color: "white" }}>
                  {`${currentWallet.account?.substring(
                    0,
                    6
                  )}...${currentWallet.account?.substring(
                    currentWallet.account.length - 4
                  )}`}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  currentWallet.disconnectWallet();
                  toggleDrawer();
                }}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
                startIcon={<LogoutIcon />}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                open();
                toggleDrawer();
              }}
              sx={{
                backgroundColor: "#FFA000",
                "&:hover": { backgroundColor: "#FF8F00" },
              }}
              startIcon={<AccountBalanceWalletIcon />}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
