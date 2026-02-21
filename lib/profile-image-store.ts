"use client"

import { createClient } from "@/lib/supabase/client"

const USER_ID = "sophia.ko"

export interface ProfileImageData {
  imageUrl: string
  cropZoom: number
  cropOffsetX: number
  cropOffsetY: number
}

// Load profile image from Supabase
export async function loadProfileImage(): Promise<ProfileImageData | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("profile_images")
      .select("image_url, crop_zoom, crop_offset_x, crop_offset_y")
      .eq("user_id", USER_ID)
      .single()

    if (error) {
      console.error("Error loading profile image:", error)
      // Fallback to localStorage
      const localImage = localStorage.getItem("profileImage")
      const localCrop = localStorage.getItem("profileCrop")

      if (localImage) {
        const crop = localCrop ? JSON.parse(localCrop) : { zoom: 1, offset: { x: 0, y: 0 } }
        return {
          imageUrl: localImage,
          cropZoom: crop.zoom ?? 1,
          cropOffsetX: crop.offset?.x ?? 0,
          cropOffsetY: crop.offset?.y ?? 0,
        }
      }
      return null
    }

    return {
      imageUrl: data.image_url,
      cropZoom: data.crop_zoom,
      cropOffsetX: data.crop_offset_x,
      cropOffsetY: data.crop_offset_y,
    }
  } catch (error) {
    console.error("Failed to load profile image:", error)
    return null
  }
}

// Upload image to Supabase Storage
export async function uploadProfileImage(file: File): Promise<string | null> {
  try {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `profile-${Date.now()}.${fileExt}`
    const filePath = `${USER_ID}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error("Error uploading image:", uploadError)

      // Fallback to base64 localStorage
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          localStorage.setItem("profileImage", result)
          resolve(result)
        }
        reader.readAsDataURL(file)
      })
    }

    // Get public URL
    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Failed to upload image:", error)

    // Fallback to base64 localStorage
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        localStorage.setItem("profileImage", result)
        resolve(result)
      }
      reader.readAsDataURL(file)
    })
  }
}

// Save profile image data to database
export async function saveProfileImageData(imageUrl: string, cropZoom: number, cropOffsetX: number, cropOffsetY: number): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("profile_images")
      .upsert({
        user_id: USER_ID,
        image_url: imageUrl,
        crop_zoom: cropZoom,
        crop_offset_x: cropOffsetX,
        crop_offset_y: cropOffsetY,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error("Error saving profile image data:", error)
      // Fallback to localStorage
      localStorage.setItem("profileImage", imageUrl)
      localStorage.setItem("profileCrop", JSON.stringify({
        zoom: cropZoom,
        offset: { x: cropOffsetX, y: cropOffsetY }
      }))
    }
  } catch (error) {
    console.error("Failed to save profile image data:", error)
    // Fallback to localStorage
    localStorage.setItem("profileImage", imageUrl)
    localStorage.setItem("profileCrop", JSON.stringify({
      zoom: cropZoom,
      offset: { x: cropOffsetX, y: cropOffsetY }
    }))
  }
}

// Save crop settings only
export async function saveCropSettings(cropZoom: number, cropOffsetX: number, cropOffsetY: number): Promise<void> {
  try {
    const supabase = createClient()

    // Get current image URL
    const { data } = await supabase
      .from("profile_images")
      .select("image_url")
      .eq("user_id", USER_ID)
      .single()

    if (data?.image_url) {
      await saveProfileImageData(data.image_url, cropZoom, cropOffsetX, cropOffsetY)
    } else {
      // Just save to localStorage if no image in DB
      localStorage.setItem("profileCrop", JSON.stringify({
        zoom: cropZoom,
        offset: { x: cropOffsetX, y: cropOffsetY }
      }))
    }
  } catch (error) {
    console.error("Failed to save crop settings:", error)
    localStorage.setItem("profileCrop", JSON.stringify({
      zoom: cropZoom,
      offset: { x: cropOffsetX, y: cropOffsetY }
    }))
  }
}
