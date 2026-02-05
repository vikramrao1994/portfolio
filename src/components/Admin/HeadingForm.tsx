"use client";

import {
  Body,
  Button,
  CheckboxInput,
  EmailInput,
  Grid,
  Heading,
  TelInput,
  TextInput,
  UrlInput,
} from "@publicplan/kern-react-kit";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferProcedureInput } from "@trpc/server";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTRPC } from "@/trpc/client";
import type { AppRouter } from "@/trpc/router";
import { spacing } from "@/utils/utils";

// Infer input type directly from tRPC procedure
type HeadingFormInputs = inferProcedureInput<AppRouter["heading"]["update"]>;

const HeadingForm = () => {
  const trpc = useTRPC();

  // Fetch current heading data
  const { data: heading, isLoading, refetch } = useQuery(trpc.heading.getRaw.queryOptions());

  // Update mutation
  const updateMutation = useMutation(
    trpc.heading.update.mutationOptions({
      onSuccess: () => {
        refetch();
      },
    }),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<HeadingFormInputs>({
    defaultValues: {
      name: "",
      subheadline_en: "",
      subheadline_de: "",
      headline_en: "",
      headline_de: "",
      address_en: "",
      address_de: "",
      email: "",
      phone: "",
      website: "",
      linkedin: "",
      github: "",
      instagram: "",
      age: "",
      years_of_experience: "",
      open_to_opportunities: false,
    },
  });

  // Populate form when data loads
  useEffect(() => {
    console.log("heading: ", heading);
    if (heading) {
      reset({ ...heading });
    }
  }, [heading, reset]);

  const onSubmit: SubmitHandler<HeadingFormInputs> = async (data) => {
    try {
      await updateMutation.mutateAsync(data);
    } catch (err) {
      console.error("Failed to update heading:", err);
    }
  };

  if (isLoading) {
    return <Body>Loading...</Body>;
  }

  if (!heading) {
    return <Body>No heading data found.</Body>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid>
        {/* Basic Info */}
        <div style={{ marginBottom: spacing(3) }}>
          <Heading
            type="small"
            headerElement="h3"
            title="Basic Information"
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="name"
            label="Name"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="age"
            label="Age"
            {...register("age")}
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="years_of_experience"
            label="Years of Experience"
            {...register("years_of_experience")}
            style={{ marginBottom: spacing(2) }}
          />
        </div>

        {/* Headlines */}
        <div style={{ marginBottom: spacing(3) }}>
          <Heading
            type="small"
            headerElement="h3"
            title="Headlines (EN/DE)"
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="headline_en"
            label="Headline (English)"
            {...register("headline_en", { required: "English headline is required" })}
            error={errors.headline_en?.message}
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="headline_de"
            label="Headline (German)"
            {...register("headline_de", { required: "German headline is required" })}
            error={errors.headline_de?.message}
            style={{ marginBottom: spacing(2) }}
          />
        </div>

        {/* Subheadlines */}
        <div style={{ marginBottom: spacing(3) }}>
          <Heading
            type="small"
            headerElement="h3"
            title="Subheadlines (EN/DE)"
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="subheadline_en"
            label="Subheadline (English)"
            {...register("subheadline_en", { required: "English subheadline is required" })}
            error={errors.subheadline_en?.message}
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="subheadline_de"
            label="Subheadline (German)"
            {...register("subheadline_de", { required: "German subheadline is required" })}
            error={errors.subheadline_de?.message}
            style={{ marginBottom: spacing(2) }}
          />
        </div>

        {/* Address */}
        <div style={{ marginBottom: spacing(3) }}>
          <Heading
            type="small"
            headerElement="h3"
            title="Address (EN/DE)"
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="address_en"
            label="Address (English)"
            {...register("address_en", { required: "English address is required" })}
            error={errors.address_en?.message}
            style={{ marginBottom: spacing(2) }}
          />
          <TextInput
            id="address_de"
            label="Address (German)"
            {...register("address_de", { required: "German address is required" })}
            error={errors.address_de?.message}
            style={{ marginBottom: spacing(2) }}
          />
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: spacing(3) }}>
          <Heading
            type="small"
            headerElement="h3"
            title="Contact Information"
            style={{ marginBottom: spacing(2) }}
          />
          <EmailInput
            id="email"
            label="Email"
            {...register("email")}
            error={errors.email?.message}
            style={{ marginBottom: spacing(2) }}
          />
          <TelInput
            id="phone"
            label="Phone"
            {...register("phone")}
            style={{ marginBottom: spacing(2) }}
          />
          <UrlInput
            id="website"
            label="Website"
            {...register("website")}
            error={errors.website?.message}
            style={{ marginBottom: spacing(2) }}
          />
        </div>

        {/* Social Links */}
        <div style={{ marginBottom: spacing(3) }}>
          <Heading
            type="small"
            headerElement="h3"
            title="Social Links"
            style={{ marginBottom: spacing(2) }}
          />
          <UrlInput
            id="linkedin"
            label="LinkedIn"
            {...register("linkedin")}
            error={errors.linkedin?.message}
            style={{ marginBottom: spacing(2) }}
          />
          <UrlInput
            id="github"
            label="GitHub"
            {...register("github")}
            error={errors.github?.message}
            style={{ marginBottom: spacing(2) }}
          />
          <UrlInput
            id="instagram"
            label="Instagram"
            {...register("instagram")}
            error={errors.instagram?.message}
            style={{ marginBottom: spacing(2) }}
          />
        </div>

        {/* Open to Opportunities */}
        <div style={{ marginBottom: spacing(3) }}>
          <CheckboxInput
            id="open_to_opportunities"
            label="Open to Opportunities"
            {...register("open_to_opportunities")}
          />
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", gap: spacing(2), justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="secondary"
            text="Reset"
            onClick={() => reset()}
            disabled={!isDirty}
          />
          <Button
            type="submit"
            variant="primary"
            text={updateMutation.isPending ? "Saving..." : "Save Changes"}
            disabled={updateMutation.isPending || !isDirty}
          />
        </div>

        {/* Status Messages */}
        {updateMutation.isSuccess && (
          <Body style={{ color: "green", marginTop: spacing(2) }}>Changes saved successfully!</Body>
        )}
        {updateMutation.isError && (
          <Body style={{ color: "red", marginTop: spacing(2) }}>
            Error: {updateMutation.error.message}
          </Body>
        )}
      </Grid>
    </form>
  );
};

export default HeadingForm;
