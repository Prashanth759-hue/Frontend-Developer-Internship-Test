import { create } from "zustand";

interface AppState {
  language: string;
  locationPermission: string;
  mobile: string;
  email: string;
  driverName: string;
  driverPhone: string;
  isLoggedIn: boolean;
  documentType: string;
  aadhaarUploaded: boolean;
  panUploaded: boolean;
  aadhaarNumber: string;
  panNumber: string;
  selfieUri: string;
  dlUploaded: boolean;
  rcUploaded: boolean;
  insuranceUploaded: boolean;
  vehiclePhotoUploaded: boolean;
  proofLoadUploaded: boolean;
  proofUnloadUploaded: boolean;
  proofLoadImage: string;
  proofUnloadImage: string;
  theme: "light" | "dark";

  setLanguage: (
    language: string
  ) => void;

  setLocationPermission: (
    permission: string
  ) => void;

  setMobile: (
    mobile: string
  ) => void;

  setEmail: (
    email: string
  ) => void;

  setDriverName: (
  name: string
  ) => void;

  setDriverPhone: (
    phone: string
  ) => void;

  setIsLoggedIn: (
    value: boolean
  ) => void;

  setDocumentType: (
  type: string
) => void;

  setAadhaarUploaded: (
  value: boolean
) => void;

setPanUploaded: (
  value: boolean
) => void;

setAadhaarNumber: (
  value: string
) => void;

setPanNumber: (
  value: string
) => void;

setSelfieUri: (
  uri: string
) => void;

setDlUploaded: (
  value: boolean
) => void;

setRcUploaded: (
  value: boolean
) => void;

setInsuranceUploaded: (
  value: boolean
) => void;

setVehiclePhotoUploaded: (
  value: boolean
) => void;

setProofLoadUploaded: (
  value: boolean
) => void;

setProofUnloadUploaded: (
  value: boolean
) => void;

setProofLoadImage: (
  uri: string
) => void;

setProofUnloadImage: (
  uri: string
) => void;

setTheme: (
  theme: "light" | "dark"
) => void;
}
  


export const useAppStore =
  create<AppState>((set) => ({
    language: "en",
    locationPermission:
      "unknown",

    mobile: "",
    email: "",
    driverName: "",
    driverPhone: "",
    isLoggedIn: false,
    documentType: "",
    aadhaarUploaded: false,
    panUploaded: false,
    aadhaarNumber: "",
    panNumber: "",
    selfieUri: "",
    dlUploaded: false,
    rcUploaded: false,
    insuranceUploaded: false,
    vehiclePhotoUploaded: false,
    proofLoadUploaded: false,
    proofUnloadUploaded: false,
    proofLoadImage: "",
    proofUnloadImage: "",
    theme: "light",

    setLanguage: (
      language
    ) =>
      set({
        language,
      }),

    setLocationPermission: (
      permission
    ) =>
      set({
        locationPermission:
          permission,
      }),

    setMobile: (
      mobile
    ) =>
      set({
        mobile,
      }),

    setEmail: (
      email
    ) =>
      set({
        email,
      }),

    setDriverName: (
      name
    ) =>
      set({
        driverName: name,
      }),

    setDriverPhone: (
      phone
    ) =>
      set({
        driverPhone: phone,
      }),

    setIsLoggedIn: (
      value
    ) =>
      set({
        isLoggedIn: value,
      }),


    setDocumentType: (
     type: string
    ) =>
     set({
      documentType: type,
      }),

    setAadhaarUploaded: (
  value
) =>
  set({
    aadhaarUploaded: value,
  }),

setPanUploaded: (
  value
) =>
  set({
    panUploaded: value,
  }),

setAadhaarNumber: (
  value
) =>
  set({
    aadhaarNumber: value,
  }),

setPanNumber: (
  value
) =>
  set({
    panNumber: value,
  }),

setSelfieUri: (
  uri
) =>
  set({
    selfieUri: uri,
  }),

  setDlUploaded: (
  value
) =>
  set({
    dlUploaded: value,
  }),

setRcUploaded: (
  value
) =>
  set({
    rcUploaded: value,
  }),

setInsuranceUploaded: (
  value
) =>
  set({
    insuranceUploaded: value,
  }),

setVehiclePhotoUploaded: (
  value
) =>
  set({
    vehiclePhotoUploaded: value,
  }),
  
  setProofLoadUploaded:
(value)=>
set({
proofLoadUploaded:value,
}),

setProofUnloadUploaded:
(value)=>
set({
proofUnloadUploaded:value,
}),

setProofLoadImage: (
  uri
) =>
  set({
    proofLoadImage: uri,
  }),

  setProofUnloadImage: (
  uri
) =>
set({
  proofUnloadImage: uri,
}),

setTheme: (theme) =>
  set({
    theme,
  }),
}));