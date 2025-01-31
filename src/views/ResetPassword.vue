<template>
	<div id="error-message" v-if="errorMessage" class="error-message">
    ✖ {{ errorMessage }}
    </div>
    <div class="mform">
		<div v-if="isLoading" class="loading-overlay">
			<div class="spinner"></div>
		</div>
		<div class="left">
			<img src="/img/logoMini.png" alt="Logo do Sysroot" id="logo" />
			<h1>Redefinir a Senha</h1>
		</div>
		<div class="right">
			<form class="formContainer" @submit.prevent="handleStep">
				<div class="centered">

					<transition 
					:name="'goingForward' ? 'slide-right' : 'slide-left'"
					>
					<div v-if="currentStep === 1" key="step1">
						<div class="sepElements">
							<label for="email">E-mail</label>
							<input 
								class="input" 
								type="email" 
								v-model="email" 
								id="email" 
								placeholder="Seu e-mail" 
								required 
							/>
						</div>
					</div>
					</transition>

					<transition 
					:name="'goingForward' ? 'slide-right' : 'slide-left'"
					>
						<div v-if="currentStep === 2" key="step2">
							<div class="sepElements">
								<label for="code">Código de segurança</label>
								<input 
									class="input" 
									type="text" 
									v-model="code" 
									id="code" 
									placeholder="Código recebido no e-mail" 
									required 
								/>
							</div>
						</div>
					</transition>

					<transition 
					:name="'goingForward' ? 'slide-right' : 'slide-left'"
					>
						<div v-if="currentStep === 3" key="step3">
							<div class="sepElements">
								<label for="newPassword">Nova senha</label>
								<input 
									class="input" 
									type="password" 
									v-model="newPassword" 
									id="newPassword" 
									placeholder="Digite sua nova senha" 
									required 
								/>
								<label for="confirmPassword">Confirme a nova senha</label>
								<input 
									class="input" 
									type="password" 
									v-model="confirmPassword" 
									id="confirmPassword" 
									placeholder="Confirme sua nova senha" 
									required 
								/>
							</div>
						</div>
					</transition>

					<transition 
						:name="'goingForward' ? 'slide-right' : 'slide-left'"
					>
						<div v-if="currentStep === 0">
							<div class="formStep" data-step="0">
								<div class="sepElements">
									<p>{{ informationMessage }}</p>
								</div>
							</div>
						</div>
					</transition>
				</div>
				<div class="sepButtons">
                    <button
                        v-for="(button, index) in buttons[currentStep]"
                        :key="index"
                        :class="button.class"
                        :type="button.type"
                        @click="button.action && handleButtonClick(button.action)"
                    >
                        {{ button.text }}
                    </button>
                </div>
			</form>
		</div>
    </div>
</template>

<script>
export default {
	data() {
		return {
			currentStep: 1,
			email: "",
			code: "",
			newPassword: "",
			confirmPassword: "",
			userID: "",
			userName: "",
			isLoading: false,
			errorMessage: "",
			informationMessage: "",
			buttons: {
				0: [
					{ text: 'Confirmar', class: 'btn confirm', type: 'submit', action: 'back' }
				],
				1: [
					{ text: 'Cancelar', class: 'btn destructive', type: 'button', action: 'back' },
					{ text: 'Próximo', class: 'btn confirm', type: 'submit', action: 'forward' }
				],
				2: [
					{ text: 'Voltar', class: 'btn', type: 'button', action: 'lback' },
					{ text: 'Próximo', class: 'btn confirm', type: 'submit', action: 'forward' }
				],
				3: [
					{ text: 'Voltar', class: 'btn', type: 'button', action: 'lback' },
					{ text: 'Alterar', class: 'btn confirm', type: 'submit', action: 'forward' }
				],
			}
		};
	},
	mounted() {
		this.errorMessage = "";
	},
	methods: {
		async step1() {
			this.errorMessage = "";
			this.isLoading = true;
			try {
				const response1 = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'check-user'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: this.email }),
				});

				if (response1.ok) {
					const userData = await response1.json();
					this.userID = userData.id;
					this.userName = userData.nickname;

					const response2 = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'generate-reset-token'), {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ email: this.email, userId: this.userID, nickname: this.userName }),
					});

					if (!response2.ok) {
						const errorData = await response2.json();
						this.errorMessage = `${errorData.message}`;
					} else {
						this.chgStep();
					}
				} else {
					const errorData = await response1.json();
					this.errorMessage = `${errorData.message}`;
				}
			} catch (error) {
				console.error("Erro:", error);
				this.errorMessage = "Ocorreu um erro ao validar o valor.";
			} finally {
				this.isLoading = false;
			}
		},
		async step2() {
			this.errorMessage = "";
			this.isLoading = true;
			try {
				const response = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'validate-reset-token'), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ 
						email: this.email, 
						resetToken: this.code 
					}),
				});

				if (response.ok) {
					this.chgStep();
				} else {
					const errorData = await response.json();
					this.errorMessage = `${errorData.message}`;
				}
			} catch (error) {
				console.error("Erro:", error);
				this.errorMessage = "Erro ao validar o código.";
			} finally {
				this.isLoading = false;
			}
		},
		async step3() {
			this.errorMessage = "";
			this.isLoading = true;
			try {
				if (this.newPassword !== this.confirmPassword) {
					this.errorMessage = "As senhas não coincidem.";
					return;
				}

				const response = await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3000, 'reset-password'), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: this.email,
						resetToken: this.code,
						newPassword: this.newPassword,
					}),
				});

				if (response.ok) {
					await fetch(this.$globalFunc.getCompleteUrl(window.location.host, 3001, 'send-email'), {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
						user_id: this.userId,
						structure_name: "resetedPassword",
						variables: {
							username: this.userName,
							to: this.email,
							subject: "Senha alterada com sucesso",
						}
						}),
					});
					this.informationMessage = "Senha alterada com sucesso.";
					this.currentStep = 0;
				} else {
					const errorData = await response.json();
					this.errorMessage = `${errorData.message}`;
				}
			} catch (error) {
				console.error("Erro:", error);
				this.errorMessage = "Erro ao redefinir senha.";
			} finally {
				this.isLoading = false;
			}
		},
		back() {
			this.$router.push({name: 'Login'});
		},
        lback() {
            this.errorMessage = "";
            this.currentStep--;
            this.goingForward = false;
        },
        forward() {
            this.errorMessage = "";
            this.goingForward = true;
        },
        handleButtonClick(action) {
            if (this[action]) {
                this[action]();
            }  else {
                console.warn(`Ação "${action}" não encontrada.`);
            }
        },
        handleStep() {
            const stepMethod = `step${this.currentStep}`; // Monta o nome do método dinamicamente
            if (typeof this[stepMethod] === 'function') {
                this[stepMethod](); // Chama o método correspondente
            } else {
                console.warn(`Método ${stepMethod} não existe.`);
            }
        },
        chgStep() {
            this.goingForward && this.currentStep < 4 ? this.currentStep++ : this.currentStep--;
        },
	},
};
</script>

<style scoped>
  @import url('/src/assets/css/modules/mainForm.css');
</style>
