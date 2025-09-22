import React, { useState } from "react";
import { createTicket } from "./CreateTicketForm.service";

interface CreateTicketFormProps {
  user?: { id: number; email: string };
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ user }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("rede_e_internet");
  const [priority, setPriority] = useState<string>("baixa");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setAttachmentError(null);
    } else {
      setAttachment(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setAttachmentError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("priority", priority);

    if (assigneeId) {
      formData.append("assignee_id", assigneeId);
    }

    if (attachment) {
      formData.append("attachment", attachment);
    }

    const result = await createTicket(formData);

    if (result.success) {
      setMessage(result.message);
      setTitle("");
      setDescription("");
      setCategory("rede_e_internet");
      setPriority("baixa");
      setAssigneeId("");
      setAttachment(null);
      const fileInput = document.getElementById(
        "attachment"
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      alert(result.message);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="form-container">
      <h3>Abrir Novo Chamado</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título do Problema:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrição Detalhada:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoria:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="rede_e_internet">Rede e Internet</option>
            <option value="equipamentos">Equipamentos</option>
            <option value="sistemas_e_programas">Sistemas e Programas</option>
            <option value="acessos_e_senhas">Acessos e Senhas</option>
            <option value="email_e_comunicacao">E-mail e Comunicação</option>
            <option value="seguranca_da_informacao">
              Segurança da Informação
            </option>
            <option value="solicitacao_de_servico">
              Solicitação de Serviço
            </option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Prioridade:</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="Alta">Alta</option>
          </select>
        </div>

        <div className="form-group">
          <div className="file-upload-wrapper">
            <label htmlFor="attachment" className="custom-file-upload">
              🖼️ Selecionar imagem
            </label>
            <input
              type="file"
              accept="image/*"
              id="attachment"
              onChange={handleFileChange}
            />
          </div>
          {attachmentError && (
            <p style={{ color: "red", fontSize: "0.8em" }}>{attachmentError}</p>
          )}
          {attachment && (
            <p style={{ fontSize: "0.9em", marginTop: "5px" }}>
              Arquivo selecionado: {attachment.name}
            </p>
          )}
        </div>

        <button type="submit">Abrir Chamado</button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CreateTicketForm;














// frontend/src/components/CreateTicketForm.jsx
// import React, { useState, useEffect } from 'react';

// function CreateTicketForm({ user }) {
//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [category, setCategory] = useState('rede_e_internet');
//     const [priority, setPriority] = useState('baixa');
//     // O assigneeId é mantido, mas não será alterado pelo usuário.
//     const [assigneeId, setAssigneeId] = useState(''); 
//     
//     // Os estados para a funcionalidade de atribuição estão comentados
//     // const [assignableUsers, setAssignableUsers] = useState([]);
//     // const [loadingAssignableUsers, setLoadingAssignableUsers] = useState(true);
//     
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');
//     const [attachment, setAttachment] = useState(null);
//     const [attachmentError, setAttachmentError] = useState(null);

//     const token = localStorage.getItem('access_token');

//     

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setAttachment(file);
//             setAttachmentError(null);
//         } else {
//             setAttachment(null);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage('');
//         setError('');
//         setAttachmentError(null);

//         if (!token) {
//             setError('Você precisa estar logado para abrir um chamado.');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('title', title);
//         formData.append('description', description);
//         formData.append('category', category);
//         formData.append('priority', priority);
//         
//         // O campo assignee_id só é adicionado se houver um valor. Como ele não é mais alterado, não será enviado.
//         if (assigneeId) {
//             formData.append('assignee_id', assigneeId);
//         }

//         if (attachment) {
//             formData.append('attachment', attachment);
//         }

//         try {
//             const response = await fetch('/api/tickets/', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: formData
//             });

//             if (response.ok) {
//                 setMessage('Chamado aberto com sucesso!');
//                 setTitle('');
//                 setDescription('');
//                 setCategory('rede_e_internet');
//                 setPriority('baixa');
//                 setAssigneeId('');
//                 setAttachment(null);
//                 const fileInput = document.getElementById('attachment');
//                 if (fileInput) fileInput.value = ''; 
//                 alert("Chamado criado com sucesso!.")
//             } else {
//                 const errorData = await response.json();
//                 if (response.status === 422 && errorData.detail) {
//                     const validationErrors = errorData.detail.map(err => {
//                         const fieldName = err.loc[1] === 'assignee_id' ? 'Técnico responsável' : err.loc[1];
//                         return `${fieldName}: ${err.msg}`;
//                     }).join(', ');
//                     setError(`Erro de validação: ${validationErrors}`);
//                 } else {
//                     setError(errorData.detail || 'Falha ao abrir o chamado.');
//                 }
//             }
//         } catch (err) {
//             console.error("Erro ao enviar o chamado:", err);
//             setError('Não foi possível conectar ao servidor para abrir o chamado.');
//         }
//     };

//     

//     return (
//         <div className="form-container">
//             <h3>Abrir Novo Chamado</h3>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label htmlFor="title">Título do Problema:</label>
//                     <input
//                         type="text"
//                         id="title"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="description">Descrição Detalhada:</label>
//                     <textarea
//                         id="description"
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                         rows="5"
//                         required
//                     ></textarea>
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="category">Categoria:</label>
//                     <select
//                         id="category"
//                         value={category}
//                         onChange={(e) => setCategory(e.target.value)}
//                         required
//                     >
//                         <option value="rede_e_internet">Rede e Internet</option>
//                         <option value="equipamentos">Equipamentos</option>
//                         <option value="sistemas_e_programas">Sistemas e Programas</option>
//                         <option value="acessos_e_senhas">Acessos e Senhas</option>
//                         <option value="email_e_comunicacao">E-mail e Comunicação</option>
//                         <option value="seguranca_da_informacao">Segurança da Informação</option>
//                         <option value="solicitacao_de_servico">Solicitação de Serviço</option>
//                         <option value="outros">Outros</option>
//                     </select>
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="priority">Prioridade:</label>
//                     <select
//                         id="priority"
//                         value={priority}
//                         onChange={(e) => setPriority(e.target.value)}
//                         required
//                     >
//                         <option value="baixa">Baixa</option>
//                         <option value="média">Média</option>
//                         <option value="Alta">Alta</option>
//                     </select>
//                 </div>
//                 
//                 {/* O bloco para selecionar o técnico foi comentado */}
//                 {/*                 {assignableUsers.length > 0 && user?.id && (
//                     <div className="form-group">
//                         <label htmlFor="assignee">Atribuir a:</label>
//                         <select
//                             id="assignee"
//                             value={assigneeId}
//                             onChange={(e) => setAssigneeId(e.target.value)}
//                         >
//                             <option value=""> Não Atribuído </option>
//                             {assignableUsers.map((u) => (
//                                 <option key={u.id} value={u.id}>
//                                     {getUsernameFromEmail(u.email)} ({u.is_super_admin ? 'Super Admin' : 'Admin'})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 )}
//                 */}

//                 <div className="form-group">
//                     <div className="file-upload-wrapper">
//             <label htmlFor="attachment" className="custom-file-upload">
//                 🖼️ Selecionar imagem
//             </label>
//             <input
//                 type="file"
//                 accept="image/*"
//                 id="attachment"
//                 onChange={handleFileChange}
//             />
//         </div>
//                     {attachmentError && <p style={{ color: 'red', fontSize: '0.8em' }}>{attachmentError}</p>}
//                     {attachment && <p style={{ fontSize: '0.9em', marginTop: '5px' }}>Arquivo selecionado: {attachment.name}</p>}
//                 </div>
//                 
//                 <button type="submit">Abrir Chamado</button>
//             </form>

//             {message && <p style={{ color: 'green' }}>{message}</p>}
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//         </div>
//     );
// }

// export default CreateTicketForm;   