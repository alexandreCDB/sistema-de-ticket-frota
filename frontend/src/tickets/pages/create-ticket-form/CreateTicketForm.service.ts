//@ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export interface TicketResponse {
  success: boolean;
  message: string;
}

export async function createTicket(formData: FormData): Promise<TicketResponse> {
  try {
    const response = await fetch(`${API_URL}/ticket/tickets/`, {
      method: "POST",
      credentials: "include", 
      body: formData,
    });

    if (response.ok) {
      return { success: true, message: "Chamado criado com sucesso!" };
    }

    const errorData = await response.json();

    if (response.status === 422 && errorData.detail) {
      const validationErrors = errorData.detail
        .map((err: { loc: string[]; msg: string }) => {
          const fieldName =
            err.loc[1] === "assignee_id" ? "Técnico responsável" : err.loc[1];
          return `${fieldName}: ${err.msg}`;
        })
        .join(", ");
      return { success: false, message: `Erro de validação: ${validationErrors}` };
    }

    return {
      success: false,
      message: errorData.detail || "Falha ao abrir o chamado.",
    };
  } catch (err) {
    console.error("Erro ao enviar o chamado:", err);
    return {
      success: false,
      message: "Não foi possível conectar ao servidor para abrir o chamado.",
    };
  }
}
