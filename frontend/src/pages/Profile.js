import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import Select from "../components/Select";
import UnitSelect from "../components/UnitSelect";
import ImageCropper from "../components/ImageCropper";

const Profile = () => {
  const navigate = useNavigate();
  const { logout, user: contextUser } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showRemovePhotoConfirm, setShowRemovePhotoConfirm] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    currentBodyWeight: "",
    height: "",
    fitnessFrequencyPerWeek: "",
  });
  const [initialFormData, setInitialFormData] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [heightType, setHeightType] = useState("cm");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [initialUnits, setInitialUnits] = useState({ weightUnit: 'kg', heightUnit: 'cm' });

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [initialPhotoPreview, setInitialPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [contextUser]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const user = response.data.user;
      initializeForm(user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (contextUser) {
        initializeForm(contextUser);
      }
    }
  };

  const initializeForm = (user) => {
    const initialData = {
      age: user.age || "",
      currentBodyWeight: user.currentBodyWeight || "",
      height: user.height || "",
      fitnessFrequencyPerWeek: user.fitnessFrequencyPerWeek || "",
    };
    setFormData(initialData);
    setInitialFormData(initialData);

    // Set Units from User Preference
    if (user.weightUnit) {
      setWeightUnit(user.weightUnit);
      setInitialUnits(prev => ({ ...prev, weightUnit: user.weightUnit }));
    }
    if (user.heightUnit) {
      setHeightType(user.heightUnit);
      setInitialUnits(prev => ({ ...prev, heightUnit: user.heightUnit }));
    }

    // Handle Height Display
    if (user.height) {
      if (user.heightUnit === 'ftin') {
        const totalInches = Number(user.height) / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches - feet * 12);
        setHeightFeet(feet ? String(feet) : "");
        setHeightInches(inches ? String(inches) : "");
      }
    }

    // Handle Weight Display
    if (user.currentBodyWeight && user.weightUnit === 'lb') {
      const weightInKg = Number(user.currentBodyWeight);
      const weightInLb = (weightInKg * 2.20462).toFixed(2);
      setFormData(prev => ({ ...prev, currentBodyWeight: weightInLb }));
      setInitialFormData(prev => ({ ...prev, currentBodyWeight: weightInLb }));
    }

    if (user.profilePhoto) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const baseUrl = apiUrl.replace('/api', '');
      const photoUrl = `${baseUrl}/${user.profilePhoto}`;
      setPhotoPreview(photoUrl);
      setInitialPhotoPreview(photoUrl);
    }
  };

  const handleWeightUnitChange = (newUnit) => {
    const currentWeight = Number(formData.currentBodyWeight);
    if (currentWeight && weightUnit !== newUnit) {
      let convertedWeight;
      if (newUnit === "lb") {
        convertedWeight = (currentWeight * 2.20462).toFixed(2);
      } else {
        convertedWeight = (currentWeight * 0.453592).toFixed(2);
      }
      setFormData({
        ...formData,
        currentBodyWeight: convertedWeight,
      });
    }
    setWeightUnit(newUnit);
  };

  const handleHeightTypeChange = (newType) => {
    if (heightType !== newType) {
      if (newType === "ftin") {
        const heightCm = Number(formData.height);
        if (heightCm) {
          const totalInches = heightCm / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches - feet * 12);
          setHeightFeet(String(feet));
          setHeightInches(String(inches));
        }
      } else {
        const feet = Number(heightFeet) || 0;
        const inches = Number(heightInches) || 0;
        if (feet || inches) {
          const totalInches = feet * 12 + inches;
          const heightCm = (totalInches * 2.54).toFixed(1);
          setFormData({
            ...formData,
            height: heightCm,
          });
        }
      }
    }
    setHeightType(newType);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setProfilePhoto(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    setCroppedBlob(croppedBlob);
    setPhotoPreview(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setProfilePhoto(null);
    setPhotoPreview(initialPhotoPreview);
    setCroppedBlob(null);
  };

  const isFormChanged = () => {
    const isDataChanged =
      String(formData.age) !== String(initialFormData.age) ||
      String(formData.currentBodyWeight) !== String(initialFormData.currentBodyWeight) ||
      String(formData.height) !== String(initialFormData.height) ||
      formData.fitnessFrequencyPerWeek !== initialFormData.fitnessFrequencyPerWeek;

    const isUnitsChanged =
      weightUnit !== initialUnits.weightUnit ||
      heightType !== initialUnits.heightUnit;

    const isPhotoChanged = croppedBlob !== null;

    return isDataChanged || isUnitsChanged || isPhotoChanged;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormChanged()) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let heightCm = 0;
      if (heightType === "cm") {
        heightCm = Number(formData.height) || 0;
      } else {
        const ft = Number(heightFeet) || 0;
        const inch = Number(heightInches) || 0;
        const totalInches = ft * 12 + inch;
        heightCm = totalInches * 2.54;
      }

      let weightKg = 0;
      if (weightUnit === "kg") {
        weightKg = Number(formData.currentBodyWeight) || 0;
      } else {
        weightKg = (Number(formData.currentBodyWeight) || 0) * 0.45359237;
      }

      const submitData = new FormData();
      submitData.append('age', formData.age);
      submitData.append('currentBodyWeight', Number(weightKg.toFixed(2)));
      submitData.append('height', Number(heightCm.toFixed(1)));
      submitData.append('fitnessFrequencyPerWeek', formData.fitnessFrequencyPerWeek);
      submitData.append('weightUnit', weightUnit);
      submitData.append('heightUnit', heightType);

      if (croppedBlob) {
        submitData.append('profilePhoto', croppedBlob, 'profile.jpg');
      }

      const response = await profileAPI.updateProfile(submitData);
      setSuccess("Profile updated successfully!");

      // Update initial state to new values
      const user = response.data.user;
      initializeForm(user);
      setCroppedBlob(null);
      setProfilePhoto(null);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await profileAPI.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      setError("Failed to delete account. Please try again.");
      setShowDelete(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home")}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Home
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Profile & Settings
          </h1>
          <button
            onClick={() => setShowLogout(true)}
            className="bg-white text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition duration-200 font-medium shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <ConfirmModal
          isOpen={showLogout}
          title="Confirm log out"
          message="You're about to log out. Continue?"
          cancelText="Cancel"
          confirmText="Log out"
          onCancel={() => setShowLogout(false)}
          onConfirm={() => {
            setShowLogout(false);
            logout();
          }}
        />

        <ConfirmModal
          isOpen={showDelete}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
          cancelText="Cancel"
          confirmText="Delete Account"
          confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDeleteAccount}
        />

        <ConfirmModal
          isOpen={showRemovePhotoConfirm}
          title="Remove Profile Photo"
          message="Are you sure you want to remove your profile photo? This action cannot be undone."
          cancelText="Cancel"
          confirmText="Remove Photo"
          confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setShowRemovePhotoConfirm(false)}
          onConfirm={async () => {
            try {
              await profileAPI.deleteProfilePhoto();
              setProfilePhoto(null);
              setPhotoPreview(null);
              setCroppedBlob(null);
              setInitialPhotoPreview(null);
              setSuccess("Profile photo removed successfully");
              setShowRemovePhotoConfirm(false);
            } catch (err) {
              setError("Failed to remove profile photo");
              setShowRemovePhotoConfirm(false);
            }
          }}
        />

        {showCropper && (
          <ImageCropper
            imageSrc={profilePhoto}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}

        {/* Profile Details Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 shadow-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload with Name and Email */}
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm flex items-center gap-6">
              <div className="mb-2 relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center transition-all duration-200 group-hover:border-indigo-200 group-hover:shadow-lg">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-indigo-400 font-bold">
                      {contextUser?.fullName?.charAt(0) || "U"}
                    </span>
                  )}
                  <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-xs transition-opacity duration-200">Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => setShowRemovePhotoConfirm(true)}
                    className="mb-2 text-xs text-red-600 hover:text-red-800 font-medium hover:underline focus:outline-none absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-900">{contextUser?.fullName || "User"}</p>
                <p className="text-gray-600">{contextUser?.email || ""}</p>
                {contextUser?.createdAt && (
                  <p className="text-sm text-indigo-600 mt-1 font-medium">
                    Member Since {new Date(contextUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Frequency</label>
                <Select
                  name="fitnessFrequencyPerWeek"
                  value={formData.fitnessFrequencyPerWeek}
                  onChange={handleChange}
                  required
                  placeholder="Select frequency"
                  className="h-[50px] "
                >
                  <option value="0-1">0-1 times</option>
                  <option value="2-3">2-3 times</option>
                  <option value="4-5">4-5 times</option>
                  <option value="6+">6+ times</option>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Weight Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <div className="relative rounded-xl shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    name="currentBodyWeight"
                    value={formData.currentBodyWeight}
                    onChange={handleChange}
                    required
                    className="block w-full pl-4 pr-24 py-3 border-0 rounded-xl focus:ring-0 focus:outline-none bg-transparent"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="weightUnit" className="sr-only">Unit</label>
                    <UnitSelect
                      id="weightUnit"
                      name="weightUnit"
                      value={weightUnit}
                      onChange={(e) => handleWeightUnitChange(e.target.value)}
                      className="h-full py-0 pl-4 w-24 border-l border-gray-200 bg-white text-gray-700 font-medium rounded-r-xl focus:ring-0 focus:outline-none sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <option value="kg">KG</option>
                      <option value="lb">LB</option>
                    </UnitSelect>
                  </div>
                </div>
              </div>

              {/* Height Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                {heightType === 'cm' ? (
                  <div className="relative rounded-xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.]*"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      required
                      className="block w-full pl-4 pr-24 py-3 border-0 rounded-xl focus:ring-0 focus:outline-none bg-transparent"
                      placeholder="0.0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <label htmlFor="heightUnit" className="sr-only">Unit</label>
                      <UnitSelect
                        id="heightUnit"
                        name="heightUnit"
                        value={heightType}
                        onChange={(e) => handleHeightTypeChange(e.target.value)}
                        className="h-full py-0 pl-4 w-24 border-l border-gray-200 bg-white text-gray-700 font-medium rounded-r-xl focus:ring-0 focus:outline-none sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <option value="cm">CM</option>
                        <option value="ftin">FT/IN</option>
                      </UnitSelect>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1 rounded-xl shadow-sm">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200"
                        placeholder="Feet"
                      />
                    </div>
                    <div className="relative flex-1 rounded-xl shadow-sm">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200"
                        placeholder="Inches"
                      />
                    </div>
                    <div className="relative">
                      <UnitSelect
                        value={heightType}
                        onChange={(e) => handleHeightTypeChange(e.target.value)}
                        className="h-full py-0 pl-4 w-24 border border-gray-200 bg-white text-gray-700 font-medium rounded-xl focus:outline-none focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <option value="cm">CM</option>
                        <option value="ftin">FT/IN</option>
                      </UnitSelect>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !isFormChanged()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transform transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Settings Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-red-800 text-lg">Delete Account</h4>
              <p className="text-red-600 mt-1 text-sm">
                Permanently delete your account and all of your data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-3 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors shadow-sm"
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;