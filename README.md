<div style="text-align: center;">
    <img src="https://raw.githubusercontent.com/victorradael/condoguard/81f8c3663e2bacb222beef5032bd9c52b9903019/assets/condoguard-logo.svg" alt="CondoguardLogo" width="200" height="200">
</div>


## CondoGuard Frontend

🌟 **CondoGuard** é uma aplicação web para ajudar condomínios a administrar suas despesas condominiais e prever possíveis problemas futuros. Este é o repositório do frontend da aplicação, desenvolvido com **Next.js** e **TypeScript**.

### 🛠 Tecnologias Utilizadas

- **Next.js**: Framework React para renderização do lado do servidor e geração de sites estáticos.
- **TypeScript**: Superset de JavaScript que adiciona tipagem estática.
- **TailwindCSS**: Framework de CSS utilitário para estilização rápida.
- **React Chart.js 2**: Biblioteca para visualização de dados.
- **Axios**: Cliente HTTP para requisições à API.

### 🔗 Repositório Backend

Este projeto depende de um backend desenvolvido em **Spring Boot**. Você pode encontrar o repositório do backend [aqui](https://github.com/seu-usuario/condoguard-backend).

### 🚀 Começando

Siga as instruções abaixo para configurar e executar o projeto localmente.

#### Pré-requisitos

- **Node.js** (v14 ou superior)
- **npm** (v6 ou superior) ou **yarn**

#### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/condoguard-frontend.git
cd condoguard-frontend
```

#### Passo 2: Instalar Dependências

Usando **npm**:

```bash
npm install
```

Ou usando **yarn**:

```bash
yarn install
```

#### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis de ambiente:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> **Nota**: Certifique-se de que o backend está rodando na URL e porta configuradas. Modifique `NEXT_PUBLIC_API_URL` se necessário.

#### Passo 4: Executar o Projeto

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

ou

```bash
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

### 🧪 Testes

Para executar os testes, você pode usar:

```bash
npm run test
```

ou

```bash
yarn test
```

### 📝 Funcionalidades

O **CondoGuard Frontend** permite:

- **Autenticação**: Login e registro de usuários.
- **Administração de Usuários**: CRUD completo de usuários (apenas para administradores).
- **Gerenciamento de Residências e Lojas**: CRUD completo para unidades condominiais.
- **Visualização de Despesas**: Gráficos interativos para despesas por categoria e data.
- **Notificações**: Envio e visualização de notificações aos usuários.

### 📦 Estrutura do Projeto

```bash
├── app
│   ├── components       # Componentes reutilizáveis
│   ├── dashboard        # Páginas do Dashboard
│   ├── layout           # Layout da aplicação
│   └── services         # Serviços para comunicação com a API
├── .env.local.example   # Exemplo de variáveis de ambiente
└── README.md            # Documentação do projeto
```

### 🔄 Integração com o Backend

Certifique-se de seguir as instruções de configuração no [repositório backend](https://github.com/victorradael/condoguard) para garantir que o servidor esteja rodando corretamente e comunicando-se com o frontend.

### 📄 Licença

Este projeto é licenciado sob a licença GNU General Public License v3.0. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

### 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests para melhorias, correções de bugs ou novas funcionalidades.

1. Faça um fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`).
4. Push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

### 📧 Contato

Se tiver alguma dúvida ou sugestão, entre em contato com [radael.engenharia@gmail.com](mailto:radael.engenharia@gmail.com).

