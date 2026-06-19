export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          wallet_address: string | null;
          role: "buyer" | "creator" | "superadmin";
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          wallet_address?: string | null;
          role?: "buyer" | "creator" | "superadmin";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string | null;
          description: string | null;
          service: string | null;
          system_prompt: string | null;
          training_data: string | null;
          price: number | null;
          currency: string;
          creator_id: string | null;
          creator_wallet: string | null;
          status: string;
          is_listed: boolean;
          is_minted: boolean;
          nft_token_id: string | null;
          contract_address: string | null;
          transaction_hash: string | null;
          zero_g_root_hash: string | null;
          zero_g_tx_hash: string | null;
          zero_g_url: string | null;
          zero_g_mode: string | null;
          zero_g_status: string | null;
          zero_g_stored_at: string | null;
          onchain_agent_id: string | null;
          onchain_registration_tx_hash: string | null;
          onchain_registered: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["agents"]["Row"]> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Row"]>;
        Relationships: [];
      };
      agent_questions: {
        Row: {
          id: string;
          agent_id: string | null;
          question: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id?: string | null;
          question: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_questions"]["Insert"]>;
        Relationships: [];
      };
      hires: {
        Row: {
          id: string;
          agent_id: string;
          buyer_id: string | null;
          buyer_wallet: string | null;
          creator_wallet: string | null;
          amount: number | null;
          currency: string;
          network: string;
          contract_address: string | null;
          payment_token_address: string | null;
          tx_hash: string | null;
          onchain_confirmed: boolean;
          hired_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["hires"]["Row"]> & {
          id: string;
          agent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["hires"]["Row"]>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          hire_id: string | null;
          agent_id: string;
          buyer_wallet: string | null;
          receiver_wallet: string | null;
          amount: number | null;
          currency: string;
          network: string | null;
          contract_address: string | null;
          payment_token_address: string | null;
          tx_hash: string | null;
          status: string;
          source: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["transactions"]["Row"]> & {
          id: string;
          agent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
        Relationships: [];
      };
      task_proofs: {
        Row: {
          id: string;
          agent_id: string;
          hire_id: string | null;
          buyer_id: string | null;
          buyer_wallet: string | null;
          task_summary: string | null;
          result_summary: string | null;
          zero_g_root_hash: string | null;
          zero_g_tx_hash: string | null;
          zero_g_url: string | null;
          zero_g_mode: string | null;
          zero_g_status: string | null;
          zero_g_stored_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["task_proofs"]["Row"]> & {
          id: string;
          agent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_proofs"]["Row"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          agent_id: string;
          buyer_id: string | null;
          buyer_wallet: string | null;
          rating: number | null;
          review: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          id: string;
          agent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
        Relationships: [];
      };
      reputation_receipts: {
        Row: {
          id: string;
          agent_id: string;
          review_id: string | null;
          reviewer_wallet: string | null;
          rating: number | null;
          review: string | null;
          zero_g_root_hash: string | null;
          zero_g_tx_hash: string | null;
          zero_g_url: string | null;
          zero_g_mode: string | null;
          zero_g_status: string | null;
          zero_g_stored_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reputation_receipts"]["Row"]> & {
          id: string;
          agent_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["reputation_receipts"]["Row"]>;
        Relationships: [];
      };
      proof_events: {
        Row: {
          id: string;
          proof_type: string | null;
          agent_id: string | null;
          related_id: string | null;
          root_hash: string | null;
          tx_hash: string | null;
          url: string | null;
          mode: string | null;
          status: string | null;
          stored_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["proof_events"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["proof_events"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
