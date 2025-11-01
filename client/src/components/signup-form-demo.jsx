"use client"

import { useState } from "react"
import Input from "./ui/input"
import Label from "./ui/label"
import LabelInputContainer from "../components/label-input-conatiner"
import BottomGradient from "./bottom-gradient"
import { IconBrandGithub, IconBrandGoogle, IconBrandOnlyfans } from "@tabler/icons-react"

export default function SignupForm() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    twitterpassword: "",
  })

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Add your form submission logic here
  }

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Welcome to Aceternity</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Login to aceternity if you can because we don&apos;t have a login flow yet
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        {/* First Name & Last Name Row */}
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input id="firstname" placeholder="Tyler" type="text" value={formData.firstname} onChange={handleChange} />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input id="lastname" placeholder="Durden" type="text" value={formData.lastname} onChange={handleChange} />
          </LabelInputContainer>
        </div>

        {/* Email */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="projectmayhem@fc.com"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </LabelInputContainer>

        {/* Password */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </LabelInputContainer>

        {/* Twitter Password */}
        <LabelInputContainer className="mb-8">
          <Label htmlFor="twitterpassword">Your twitter password</Label>
          <Input
            id="twitterpassword"
            placeholder="••••••••"
            type="password"
            value={formData.twitterpassword}
            onChange={handleChange}
          />
        </LabelInputContainer>

        {/* Submit Button */}
        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          Sign up →
          <BottomGradient />
        </button>

        {/* Divider */}
        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        {/* Social Buttons */}
        <div className="flex flex-col space-y-4">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={() => console.log("GitHub signup")}
          >
            <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">GitHub</span>
            <BottomGradient />
          </button>

          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={() => console.log("Google signup")}
          >
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Google</span>
            <BottomGradient />
          </button>

          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={() => console.log("OnlyFans signup")}
          >
            <IconBrandOnlyfans className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">OnlyFans</span>
            <BottomGradient />
          </button>
        </div>
      </form>
    </div>
  )
}
