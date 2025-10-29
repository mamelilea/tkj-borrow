import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminAPI } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const token = getAdminToken();
        if (!token) throw new Error("no-token");
        await adminAPI.getProfile(token);
        setChecking(false);
      } catch {
        navigate("/tkj-mgmt-2025/login", {
          replace: true,
          state: { from: location.pathname },
        });
      }
    };
    check();
  }, [navigate, location.pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Memeriksa sesi admin...
      </div>
    );
  }

  return children;
};

export default RequireAuth;
