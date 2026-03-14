import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/config/wagmi";
import { AuthProvider } from "@/context/AuthContext";
import { CollectionsProvider } from "@/context/CollectionsContext";
import ProtectedLayout from "@/components/ProtectedLayout";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import CreateRecord from "@/pages/doctor/CreateRecord";
import DoctorCollections from "@/pages/doctor/DoctorCollections";
import CollectionDetail from "@/pages/doctor/CollectionDetail";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import PatientRecordDetail from "@/pages/patient/PatientRecordDetail";
import HospitalDashboard from "@/pages/hospital/HospitalDashboard";
import HospitalRecordDetail from "@/pages/hospital/HospitalRecordDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <AuthProvider>
          <CollectionsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename="/examples/medical-records">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth/:persona" element={<AuthPage />} />

                  <Route element={<ProtectedLayout allowedPersona="doctor" />}>
                    <Route
                      path="/doctor/dashboard"
                      element={<DoctorDashboard />}
                    />
                    <Route
                      path="/doctor/create-record"
                      element={<CreateRecord />}
                    />
                    <Route
                      path="/doctor/collections"
                      element={<DoctorCollections />}
                    />
                    <Route
                      path="/doctor/collection/:id"
                      element={<CollectionDetail />}
                    />
                  </Route>

                  <Route element={<ProtectedLayout allowedPersona="patient" />}>
                    <Route
                      path="/patient/dashboard"
                      element={<PatientDashboard />}
                    />
                    <Route
                      path="/patient/record/:id"
                      element={<PatientRecordDetail />}
                    />
                  </Route>

                  <Route
                    element={<ProtectedLayout allowedPersona="hospital" />}
                  >
                    <Route
                      path="/hospital/dashboard"
                      element={<HospitalDashboard />}
                    />
                    <Route
                      path="/hospital/record/:id"
                      element={<HospitalRecordDetail />}
                    />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CollectionsProvider>
        </AuthProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
