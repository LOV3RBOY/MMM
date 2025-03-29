import { supabase } from "../../supabase/supabase";

export interface Model {
  id: string;
  name: string;
  image: string;
  height: string;
  measurements: string;
  age: number;
  status: "Available" | "Booked" | "On Hold";
  location: string;
  specialties: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ModelFormData {
  name: string;
  image: string;
  height: string;
  measurements: string;
  age: number;
  status: "Available" | "Booked" | "On Hold";
  location: string;
  specialties: string[];
}

export const modelService = {
  async getModels(): Promise<Model[]> {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching models:", error);
      throw error;
    }

    return data || [];
  },

  async getModelById(id: string): Promise<Model | null> {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching model with id ${id}:`, error);
      throw error;
    }

    return data;
  },

  async createModel(model: ModelFormData): Promise<Model> {
    const { data, error } = await supabase
      .from("models")
      .insert([model])
      .select()
      .single();

    if (error) {
      console.error("Error creating model:", error);
      throw error;
    }

    return data;
  },

  async updateModel(id: string, model: Partial<ModelFormData>): Promise<Model> {
    const { data, error } = await supabase
      .from("models")
      .update(model)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating model with id ${id}:`, error);
      throw error;
    }

    return data;
  },

  async deleteModel(id: string): Promise<void> {
    const { error } = await supabase.from("models").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting model with id ${id}:`, error);
      throw error;
    }
  },
};
