import { Body, Button, Grid, Heading, Loader, TextareaInput } from "@publicplan/kern-react-kit";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { useTRPC } from "@/trpc/client";
import { spacing } from "@/utils/utils";

interface AboutMeItem {
  dbId: number;
  sort_order: number;
  en: string;
  de: string;
}

interface FormValues {
  paragraphs: AboutMeItem[];
  newParagraph: {
    en: string;
    de: string;
  };
}

const AboutMeForm = () => {
  const trpc = useTRPC();

  // Fetch all about_me items
  const { data: items, isLoading, refetch } = useQuery(trpc.aboutMe.getAll.queryOptions());

  // Transform server data to use dbId instead of id
  const transformedItems = items?.map((item) => ({
    dbId: item.id,
    sort_order: item.sort_order,
    en: item.en,
    de: item.de,
  }));

  // Mutations
  const updateMutation = useMutation(trpc.aboutMe.update.mutationOptions());
  const createMutation = useMutation(trpc.aboutMe.create.mutationOptions());
  const deleteMutation = useMutation(trpc.aboutMe.delete.mutationOptions());

  // Form setup with useFieldArray for dynamic paragraphs
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      paragraphs: [],
      newParagraph: { en: "", de: "" },
    },
    values: transformedItems
      ? {
          paragraphs: transformedItems,
          newParagraph: { en: "", de: "" },
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "paragraphs",
  });

  // Save a single paragraph
  const saveParagraph = async (index: number) => {
    const values = getValues(`paragraphs.${index}`);
    if (!values) return;

    try {
      await updateMutation.mutateAsync({
        id: values.dbId,
        en: values.en,
        de: values.de,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  // Add new paragraph
  const addParagraph = handleSubmit(async (data) => {
    if (!data.newParagraph.en.trim() || !data.newParagraph.de.trim()) return;

    try {
      const result = await createMutation.mutateAsync({
        en: data.newParagraph.en,
        de: data.newParagraph.de,
      });

      // Add to field array
      append({
        dbId: result.id,
        sort_order: fields.length + 1,
        en: data.newParagraph.en,
        de: data.newParagraph.de,
      });

      await refetch();
    } catch (err) {
      console.error("Failed to create:", err);
    }
  });

  // Delete paragraph
  const deleteParagraph = async (index: number, dbId: number) => {
    if (!confirm("Are you sure you want to delete this paragraph?")) return;

    try {
      await deleteMutation.mutateAsync({ id: dbId });
      remove(index);
      await refetch();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: spacing(2),
          marginBottom: spacing(4),
        }}
      >
        <Loader visible />
      </div>
    );
  }

  return (
    <Grid>
      <Body style={{ marginBottom: spacing(2) }}>
        Manage the "About Me" paragraphs displayed on your portfolio. Each item has English and
        German versions.
      </Body>

      {/* Existing Paragraphs */}
      {fields.map((field, index) => (
        <div
          key={field.id}
          style={{
            marginBottom: spacing(2),
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing(2),
            }}
          >
            <Heading type="small" headerElement="h4" title={`Paragraph ${index + 1}`} />
            <div style={{ display: "flex", gap: spacing(1) }}>
              <Button
                iconOnly
                icon={{
                  name: "edit",
                }}
                variant="primary"
                onClick={() => saveParagraph(index)}
                disabled={updateMutation.isPending}
              />
              <Button
                variant="secondary"
                iconOnly
                icon={{
                  name: "delete",
                }}
                onClick={() => deleteParagraph(index, field.dbId)}
                disabled={deleteMutation.isPending}
              />
            </div>
          </div>

          <TextareaInput
            id={`en-${field.id}`}
            label="English"
            {...register(`paragraphs.${index}.en`, { required: "English text is required" })}
            rows={4}
            style={{ marginBottom: spacing(2) }}
            error={errors.paragraphs?.[index]?.en?.message}
          />
          <TextareaInput
            id={`de-${field.id}`}
            label="German"
            {...register(`paragraphs.${index}.de`, { required: "German text is required" })}
            rows={4}
            error={errors.paragraphs?.[index]?.de?.message}
          />
        </div>
      ))}

      {/* Add New Paragraph */}
      <div
        style={{
          marginBottom: spacing(2),
        }}
      >
        <Heading
          type="small"
          headerElement="h4"
          title="Add New Paragraph"
          style={{ marginBottom: spacing(2) }}
        />
        <TextareaInput
          id="new-en"
          label="English"
          {...register("newParagraph.en", {
            required: "English text is required",
            minLength: { value: 10, message: "English text must be at least 10 characters" },
          })}
          rows={4}
          style={{ marginBottom: spacing(2) }}
          error={errors.newParagraph?.en?.message}
        />
        <TextareaInput
          id="new-de"
          label="German"
          {...register("newParagraph.de", {
            required: "German text is required",
            minLength: { value: 10, message: "German text must be at least 10 characters" },
          })}
          rows={4}
          style={{ marginBottom: spacing(2) }}
          error={errors.newParagraph?.de?.message}
        />
        <Button
          variant="primary"
          icon={{ name: "add" }}
          iconLeft
          text={createMutation.isPending ? "Adding..." : "Add Paragraph"}
          onClick={addParagraph}
          disabled={createMutation.isPending}
          style={{ marginTop: spacing(2) }}
        />
      </div>

      {/* Status Messages */}
      {(updateMutation.isError || createMutation.isError || deleteMutation.isError) && (
        <Body style={{ color: "red", marginTop: spacing(1) }}>
          Error:{" "}
          {updateMutation.error?.message ||
            createMutation.error?.message ||
            deleteMutation.error?.message}
        </Body>
      )}
    </Grid>
  );
};

export default AboutMeForm;
