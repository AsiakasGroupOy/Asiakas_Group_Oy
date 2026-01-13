import { useState, useEffect, useRef } from "react";
import { getTwilioToken } from "../../services/apiTwilio.js";
import { useAuth } from "../users_components/AuthContext.jsx";
import { TwilioContext } from "./TwilioContext.jsx";
import { Device } from "@twilio/voice-sdk";

export const TwilioProvider = ({ children }) => {
  const { isAuthenticated, current_user_id } = useAuth();
  const deviceRef = useRef(null);
  const refreshingRef = useRef(false);
  const intervalRef = useRef(null);
  const [twilioStatus, setTwilioStatus] = useState("idle"); // idle (no user) /loading (device initialisation)/ready/error
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  async function refreshTwilioToken() {
    if (
      !current_user_id ||
      refreshingRef.current ||
      !isAuthenticated ||
      deviceRef.current.state !== "registered"
    )
      return;

    refreshingRef.current = true;

    try {
      const response = await getTwilioToken();
      if (response.status === "success") {
        await deviceRef.current.updateToken(response.data.token);
        console.log("Token refreshed");
      }
    } catch (error) {
      console.error("Refresh token error:", error);
    } finally {
      refreshingRef.current = false;
    }
  }

  useEffect(() => {
    if (!current_user_id || !isAuthenticated) {
      return;
    }

    const initDevice = async () => {
      setTwilioStatus("loading");
      try {
        const response = await getTwilioToken();
        if (response.status === "success") {
          const device = new Device(response.data.token, {
            edge: ["dublin", "frankfurt", "roaming"],
            logLevel: "error",
            codecPreferences: ["opus", "pcmu"],
          });

          deviceRef.current = device;

          // Device event handlers
          device.on("registered", () => {
            console.log("Device registered");
            setTwilioStatus("ready");
          });

          device.on("unregistered", () => {
            console.log("Device unregistered");
            setTwilioStatus("idle");
          });

          device.on("incoming", (call) => {
            console.log("Incoming call");
            setIncomingCall(call);

            call.on("accept", () => {
              setActiveCall(call);
              setIncomingCall(null);
            });

            call.on("cancel", () => {
              console.log("The call has been canceled.");
              setIncomingCall(null);
            });

            call.on("disconnect", () => {
              setActiveCall((prev) => (prev?.sid === call.sid ? null : prev));
              setIncomingCall((prev) => (prev?.sid === call.sid ? null : prev));
              console.log("Call disconnected");
            });
          });

          device.on("error", (error) => {
            console.error("Device error:", error);

            if (
              deviceRef.current &&
              deviceRef.current.state === "registered" &&
              (error.code === 20101 ||
                error.code === 20104 ||
                error.code === 31005 ||
                error.message?.toLowerCase().includes("expired"))
            ) {
              refreshTwilioToken();
            }
          });

          await device.register();
        } else {
          setTwilioStatus("error");
          console.error("Failed to get Twilio token", response.error);
        }
      } catch (error) {
        console.error("Twilio Device initialization error:", error);
        setTwilioStatus("error");
      }
    };

    initDevice();

    intervalRef.current = setInterval(() => {
      refreshTwilioToken();
    }, 55 * 60 * 1000);

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setTwilioStatus("idle");
      setActiveCall(null);
      setIncomingCall(null);
    };
  }, [current_user_id, isAuthenticated]);

  const makeCall = async (params = {}) => {
    if (!deviceRef.current || twilioStatus !== "ready") return null;
    try {
      const call = await deviceRef.current.connect({
        params: params,
      });

      call.on("accept", () => {
        setActiveCall(call);
      });

      call.on("disconnect", () => {
        setActiveCall(null);
      });
      return call;
    } catch (error) {
      console.error("Error making call:", error);
      return null;
    }
  };

  const acceptIncomingCall = () => {
    incomingCall.accept();
    setActiveCall(incomingCall);
    setIncomingCall(null);
  };

  const hangup = () => {
    deviceRef.current?.disconnectAll();
  };

  return (
    <>
      <TwilioContext.Provider
        value={{
          twilioStatus,
          refreshTwilioToken,
          makeCall,
          hangup,
          activeCall,
          incomingCall,
          acceptIncomingCall,
        }}
      >
        {children}
      </TwilioContext.Provider>
    </>
  );
};
