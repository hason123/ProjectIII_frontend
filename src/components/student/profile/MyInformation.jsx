import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CameraIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Input, Button, Space, DatePicker } from "antd";
import dayjs from "dayjs";
import { updateUser, uploadUserAvatar } from "../../../api/user";
import useUserStore from "../../../store/useUserStore";

export default function MyInformation({
                                        userData,
                                        isLoading: parentLoading,
                                        onUpdate,
                                      }) {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);
  const updateUserStoreData = useUserStore((state) => state.updateUser);

  const [isEditing, setIsEditing] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Chỉ giữ lại các trường có trong Entity User
  const [formData, setFormData] = useState({
    fullName: "",
    gmail: "",
    phoneNumber: "",
    birthday: "",
    address: "",
  });

  const [loading, setLoading] = useState(parentLoading || true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (userData) {
      setInitialData(userData);
      setFormData({
        fullName: userData.fullName || "",
        gmail: userData.gmail || "",
        phoneNumber: userData.phoneNumber || "",
        birthday: userData.birthday || "",
        address: userData.address || "",
      });
      setAvatarPreview(userData.imageUrl);
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    setLoading(parentLoading);
  }, [parentLoading]);

  const handleAntdChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

/*  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!user?.id) throw new Error("User ID not found");

      // Gửi dữ liệu cập nhật lên server
      const updatedUser = await updateUser(user.id, {
        ...formData,
        userName: initialData?.userName, // Giữ nguyên userName vì nó là unique
      });

      if (avatarFile) {
        await uploadUserAvatar(user.id, avatarFile);
      }

      const fullUserData = updatedUser.data || updatedUser;
      setInitialData(fullUserData);
      if (onUpdate) onUpdate(fullUserData);

      // Cập nhật Zustand Store
      updateUserStoreData({
        fullName: fullUserData.fullName,
        gmail: fullUserData.gmail,
        phoneNumber: fullUserData.phoneNumber,
        birthday: fullUserData.birthday,
        address: fullUserData.address,
        imageUrl: fullUserData.imageUrl,
        userName: fullUserData.userName,
      });

      setSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
      setAvatarFile(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };*/

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!user?.id) throw new Error("User ID not found");

      // 1. Cập nhật thông tin chữ (Text) trước
      const updatedUserRes = await updateUser(user.id, {
        ...formData,
        userName: initialData?.userName,
      });

      // Lấy data từ response (lúc này imageUrl vẫn là link cũ)
      let finalUserData = updatedUserRes.data || updatedUserRes;

      // 2. Upload ảnh (Nếu có chọn file mới)
      if (avatarFile) {
        const uploadRes = await uploadUserAvatar(user.id, avatarFile);

        // --- SỬA Ở ĐÂY: LẤY URL MỚI TỪ KẾT QUẢ UPLOAD ---
        // Giả sử API trả về { url: "...", publicId: "..." }
        if (uploadRes && uploadRes.url) {
          // Ghi đè link ảnh mới vào biến finalUserData
          finalUserData = {
            ...finalUserData,
            imageUrl: uploadRes.url
          };
        }
      }



      // 3. Cập nhật State nội bộ
      setInitialData(finalUserData);
      if (onUpdate) onUpdate(finalUserData);

      // 4. CẬP NHẬT ZUSTAND STORE
      // Dòng này cực kỳ quan trọng: Nó báo cho Header biết có dữ liệu mới (bao gồm ảnh mới)
      updateUserStoreData({
        ...user,            // Giữ lại token và các trường cũ
        ...finalUserData,   // Ghi đè thông tin mới
      });

      setSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
      setAvatarFile(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        gmail: initialData.gmail || "",
        phoneNumber: initialData.phoneNumber || "",
        birthday: initialData.birthday || "",
        address: initialData.address || "",
      });
      setAvatarPreview(initialData.imageUrl || null);
      setAvatarFile(null);
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading && !isEditing) {
    return (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
      <>
        <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-black/10 dark:border-white/10">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold text-[#111418] dark:text-white">
              {t("profile.thongTinCaNhan")}
            </p>
            <p className="text-[#617589] dark:text-gray-400 text-sm">
              {t("profile.capNhatThongTin")}
            </p>
          </div>
          {!isEditing && (
              <Button
                  type="primary"
                  icon={<PencilIcon className="h-4 w-4" />}
                  onClick={() => setIsEditing(true)}
              >
                {t("profile.chinhSua")}
              </Button>
          )}
        </div>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

        <div className="py-6 flex flex-col gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600">
                {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary text-white text-3xl font-bold">
                      {formData.fullName?.charAt(0) || "U"}
                    </div>
                )}
              </div>
              {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <CameraIcon className="h-8 w-8 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
              )}
            </div>

            <div className="flex-grow w-full">
              <p className="text-[#111418] dark:text-white text-sm font-medium pb-2">{t("profile.hoVaTen")}</p>
              <Input
                  value={formData.fullName}
                  onChange={(e) => handleAntdChange("fullName", e.target.value)}
                  disabled={!isEditing}
                  placeholder={t("profile.nhapHoVaTen")}
                  size="large"
              />
            </div>
          </div>

          {/* Form Fields - Chỉ giữ lại trường có trong Database */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[#111418] dark:text-white text-sm font-medium pb-2">{t("profile.email")}</p>
              <Input
                  value={formData.gmail}
                  onChange={(e) => handleAntdChange("gmail", e.target.value)}
                  disabled={!isEditing}
                  placeholder="example@gmail.com"
                  size="large"
              />
            </div>
            <div>
              <p className="text-[#111418] dark:text-white text-sm font-medium pb-2">{t("profile.soDienThoai")}</p>
              <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleAntdChange("phoneNumber", e.target.value)}
                  disabled={!isEditing}
                  placeholder={t("profile.nhapSoDienThoai")}
                  size="large"
              />
            </div>
            <div>
              <p className="text-[#111418] dark:text-white text-sm font-medium pb-2">{t("profile.ngaySinh")}</p>
              <DatePicker
                  value={formData.birthday ? dayjs(formData.birthday) : null}
                  onChange={(date) => handleAntdChange("birthday", date ? date.format("YYYY-MM-DD") : "")}
                  disabled={!isEditing}
                  format="DD/MM/YYYY"
                  className="w-full"
                  size="large"
              />
            </div>
            <div>
              <p className="text-[#111418] dark:text-white text-sm font-medium pb-2">{t("profile.diaChi")}</p>
              <Input
                  value={formData.address}
                  onChange={(e) => handleAntdChange("address", e.target.value)}
                  disabled={!isEditing}
                  placeholder={t("profile.nhapDiaChi")}
                  size="large"
              />
            </div>
          </div>
        </div>

        {isEditing && (
            <div className="flex justify-end gap-4 pt-6 border-t border-black/10 dark:border-white/10">
              <Space>
                <Button onClick={handleCancel} disabled={loading}>{t("profile.huy")}</Button>
                <Button type="primary" onClick={handleSave} loading={loading}>
                  {loading ? t("profile.dangLuu") : t("profile.luuThayDoi")}
                </Button>
              </Space>
            </div>
        )}
      </>
  );
}