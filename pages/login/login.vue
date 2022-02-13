<template>
	<view class="content">
		<!-- #ifdef H5 -->
		<wz-particlesBg :particlestyle="particlestyle"></wz-particlesBg>
		<!-- #endif -->
		<!-- #ifdef APP-PLUS -->
		<view class="logo-bg-box">
			<view class="logo-bg-box-first">
				<view class="login-bg-item-top"></view>
				<view class="login-bg-item-bottom"></view>
			</view>
			<view class="logo-bg-box-second">
				<view class="login-bg-item-top"></view>
				<view class="login-bg-item-bottom"></view>
			</view>
		</view>
		<!-- #endif -->
		<view class="logo-box">
			<!-- #ifdef APP-PLUS||H5 -->
			<button @tap="goLogin" class="logo-btn">
				<view></view>账号登陆
			</button>

			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
			<button class="logo-btn" @tap="getProfile">
				<view></view>微信授权
			</button>
			<!-- #endif -->
			<!-- #ifdef MP-TOUTIAO -->
			<button class="logo-btn" @tap="getTtProfile">
				<view></view>微信授权
			</button>
			<!-- #endif -->
			<!-- #ifdef MP-QQ || MP-BAIDU-->
			<button class="logo-btn" @getuserinfo="getProfile" openType="getUserInfo">
				<view></view>授权登陆
			</button>
			<!-- #endif -->
			<view @tap="cancelLogin" class="cancel-login">暂不登录，返回首页</view>
			<view class="login-title-info">登录即代表您同意《用户协议》和《隐私政策》</view>
		</view>
		<u-popup :show="showPopup" :round="10" mode="bottom" :closeable="true" @close="closePopup">
			<view class="login-form">
				<u-form ref="uForm" :label-style="labelStyle">
					<u-form-item label="账号 :">
						<u-input placeholder="请输入账号" v-model="username" />
					</u-form-item>
					<u-form-item label="密码 :">
						<u-input type="password" placeholder="请输入密码" v-model="password" />
					</u-form-item>
				</u-form>
				<button type="primary" @tap="login">登陆</button>
				<view class="links">
					<view @tap="gotoForgetPassword">忘记密码？</view>
					<view>|</view>
					<view class="link-highlight" @tap="gotoRegistration">注册账号</view>
				</view>
			</view>

		</u-popup>
		<u-popup :show="showPass" :round="10" mode="bottom" :closeable="true" @close="closePopup">
			<view class="login-form">
				<u-form ref="uForm" :label-style="labelStyle">
					<u-form-item label="邮箱 :">
						<u-input placeholder="请输入找回密码的邮箱" v-model="emails" />
					</u-form-item>
				</u-form>
				<button type="primary" @tap="getPassWords">找回密码</button>
				<view class="links">
					<view @tap="goLogin">立即登陆</view>
				</view>
			</view>
		</u-popup>
		<u-popup :show="showRegist" :round="10" mode="bottom" :closeable="true" @close="closePopup">
			<view class="login-form">
				<u-form ref="uForm" :label-style="labelStyle">
					<u-form-item label="邮箱 :" label-width="120">
						<u-input placeholder="请输入邮箱" v-model="reemail" />
					</u-form-item>
					<u-form-item label="验证码 :" label-width="120">
						<u-input placeholder="请输入验证码" v-model="recode" />
						<button class="codebutton" :class="{active : !disableCodeBtn}" :disabled="disableCodeBtn"
							@tap="sendCode">{{codeBtn.text}}</button>
					</u-form-item>
					<u-form-item label="账号 :" label-width="120">
						<u-input placeholder="请输入账号" v-model="reusername" />
					</u-form-item>
					<u-form-item label="密码 :" label-width="120">
						<u-input type="password" placeholder="请输入密码" v-model="repassword" />
					</u-form-item>
				</u-form>
				<button class="radius" type="primary" @tap="registra">注册</button>
				<view class="links">已有账号？<view class="link-highlight" @tap="goLogin">点此登陆</view>
				</view>
			</view>
		</u-popup>
	</view>

</template>

<script>
	import {
		localLogin,
		authVerify,
		decryptData,
		code2Session,
		localRegister
	} from "../../api/user.js";
	export default {
		data() {
			return {
				showPopup: false,
				showPass: false,
				showRegist: false,
				labelStyle: {
					color: "#434343",
				},
				codeBtn: {
					text: '获取验证码',
					waitingCode: false,
					count: this.seconds
				},
				username: '',
				password: '',
				emails: '',
				reemail: '',
				recode: '',
				reusername: '',
				repassword: '',
				disableCodeBtn: false,
				captchaImg: '',
				seconds: 60,
				particlestyle: {
					"style": "akira",
					"zindex": 1,
					"bgcolor": "#000a21"
				}
			}
		},
		methods: {
			goLogin: function() {
				this.showPass = false
				this.showRegist = false
				this.showPopup = true;
			},
			cancelLogin: function() {
				uni.switchTab({
					url: '../index/index'
				})
			},
			gotoForgetPassword: function() {
				this.showPopup = false;
				this.showPass = true;
			},
			gotoRegistration: function() {
				this.showPopup = false;
				this.showRegist = true;
			},
			login: function() {
				if (this.username == '') {
					uni.showToast({
						title: '请输入用户名',
						icon: 'error'
					})
					return;
				} else if (this.password == '') {
					uni.showToast({
						title: '请输入密码',
						icon: 'error'
					})
					return;
				} else if (this.password.length < 6) {
					uni.showToast({
						title: '密码应大于6位',
						icon: 'error'
					})
					return;
				} else {
					let data = {
						userName: this.username,
						passWord: this.password,
						isRememberMe: 1
					}
					localLogin(data).then(response => {
						if (response.code == this.$ECode.SUCCESS) {
							let token = response.data
							authVerify(token).then(res => {
								if (res.code == this.$ECode.SUCCESS) {
									uni.showToast({
										icon: "none",
										title: "登录成功",
									})
									// 设置token
									tokenUtil.set(token)
									console.log("登录成功，获取用户信息", res)
									// 设置用户信息
									uni.setStorageSync("userInfo", res.data)
									// 跳转个人中心页
									if (this.isDetail) {
										setTimeout(function() {
											uni.navigateBack({
												delta: 1,
											});
										}, 500);

									} else {
										setTimeout(function() {
											uni.navigateTo({
												url: '/pages/index/index',
											});
										}, 500);
									}
								}
							})
						} else {
							uni.showToast({
								icon: 'error',
								title: response.data
							})
						}
					})
				}
			},
			getPassWords: function() {
				let data = {
					login: this.emails,
				}
				localLogin(data).then(res => {
					if (res.status == 200) {
						uni.showToast({
							title: '重置邮箱已发送'
						})
					}
				}).catch(err => {
					uni.showToast({
						title: err.message
					})
				})
			},
			registra: function() {
				if (this.reemail == '') {
					uni.showToast({
						title: '请输入邮箱'
					})
					return;
				} else if (this.recode == '') {
					uni.showToast({
						title: '请输入验证码'
					})
					return;
				} else if (this.repassword == '') {
					uni.showToast({
						title: '请输入密码'
					})
					return;
				} else if (this.reusername == '') {
					uni.showToast({
						title: '请输入用户名'
					})
					return;
				} else if (this.repassword.length < 6) {
					uni.showToast({
						title: '密码应大于6位'
					})
					return;
				} else {
					let data = {
						userName: this.reusername,
						email: this.reemail,
						code: this.recode,
						passWord: this.repassword,
					}
					localRegister(data).then(res => {
						console.log(res);
						uni.showToast({
							title: '注册成功',
						})
						localLogin(res);
						if (this.isDetail) {
							uni.navigateBack({
								delta: 1,
							})
						} else {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}
					}).catch(err => {
						uni.showToast({
							title: err.message
						})
					})
				}

			},
			isemail: function(text) {
				var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
				return reg.test(text);
			},
			sendCode: function() {
				if (this.reemail == '' || !this.isemail(this.reemail)) {
					uni.showToast({
						title: '请输入正确的邮箱'
					})
					return;
				}

				if (this.codeBtn.waitingCode == false) {
					localLogin({
						email: this.reemail
					}).then(res => {
						console.log(res);
						if (res.status === 200) {
							uni.showToast({
								title: "验证码已发送"
							})
						}
					})
				}
				this.disableCodeBtn = true;
				this.codeBtn.waitingCode = true;
				this.codeBtn.count = this.seconds;
				this.codeBtn.text = this.codeBtn.count + 's';
				let countdown = setInterval(() => {
					this.codeBtn.count--;
					this.codeBtn.text = this.codeBtn.count + 's';
					if (this.codeBtn.count < 0) {
						clearInterval(countdown);
						this.codeBtn.text = '重新发送';
						this.codeBtn.waitingCode = false;
						this.disableCodeBtn = false;
					}
				}, 1000);
			},

			getTtProfile: function(e) {
				uni.showLoading({
					title: '正在登录...',
				})
				localLogin().then(res => {
						if (this.isDetail) {
							uni.navigateBack({
								delta: 1,
							})
						} else {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}
						tt.hideLoading()
					})
					.catch(err => {
						console.log(err)
						tt.hideLoading()
					})
			},


			getProfile: function(e) {
				uni.showLoading({
					title: '正在登录!',
					mask: true
				})
				// #ifdef MP-WEIXIN
				localLogin().then(res => {
						if (this.isDetail) {
							uni.navigateBack({
								delta: 1,
							})
						} else {
							uni.switchTab({
								url: '/pages/mine/mine'
							})
						}

						uni.hideLoading()
					})
					.catch(err => {
						console.log(err)
						uni.hideLoading()
					})
				// #endif
				// #ifdef MP-BAIDU || MP-QQ
				localLogin(e).then(res => {
						if (this.isDetail) {
							uni.navigateBack({
								delta: 1,
							})
						} else {
							uni.switchTab({
								url: '/pages/mine/mine'
							})
						}

						uni.hideLoading()
					})
					.catch(err => {
						console.log(err)
						uni.hideLoading()
					})
				// #endif

			},
			closePopup: function() {
				this.showPopup = false
				this.showPass = false
				this.showRegist = false
			}
		}
	}
</script>

<style lang="scss" scoped>
	$color-primary: #327ffa;

	.content {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background-color: #000;
	}
	.logo-bg-box {
		width: 100%;
		height: 9482rpx;
		opacity: .5;
		animation: move 60s linear infinite;
	
		.logo-bg-box-first,
		.logo-bg-box-second {
			width: 100%;
			height: 50%;
		}
	
		.login-bg-item-top {
			width: 100%;
			height: 50%;
			background: url(https://i0.hdslb.com/bfs/album/38a8dbbaef9416aa749112b2e834748aef807146.png);
			background-size: 100% 100%;
		}
	
		.login-bg-item-bottom {
			width: 100%;
			height: 50%;
			background: url(https://www.hualigs.cn/image/61371b501341c.jpg);
			background-size: 100% 100%;
		}
	
		@-webkit-keyframes move {
			0% {
				transform: translateY(0);
			}
	
			100% {
				transform: translateY(-4741rpx);
			}
		}
	
		@keyframes move {
			0% {
				transform: translateY(0);
			}
	
			100% {
				transform: translateY(-4741rpx);
			}
		}
	
	}

	.logo-bg-box {
		width: 100%;
		height: 9482rpx;
		opacity: .5;
		animation: move 60s linear infinite;

		.logo-bg-box-first,
		.logo-bg-box-second {
			width: 100%;
			height: 50%;
		}

	}

	.img-captcha {
		width: 150upx;
		height: 60upx;
	}

	button[type="primary"] {
		background-color: $color-primary;
		border-radius: 0;
		font-size: 34upx;
		margin-top: 60upx;
	}

	.logo-box {
		padding-top: 115rpx;
		position: fixed;
		top: 35%;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;

		.logo-item {
			display: block;
			width: 400rpx;
			height: 66rpx;
			margin: 0 auto 120rpx;
		}

		.logo-btn {
			width: 418rpx;
			height: 88rpx;
			background-color: #fff;
			box-shadow: 0 2rpx 16rpx 0 rgba(0, 0, 0, .08);
			border-radius: 88rpx;
			font-size: 28rpx;
			line-height: 88rpx;
			color: #1d69e2;
			display: flex;
			-webkit-box-align: center;
			align-items: center;
			-webkit-box-pack: center;
			justify-content: center;

			.iconfont {
				font-size: 40rpx;
				margin-right: 20rpx;
			}

			.weixin {
				width: 10rpx;
				height: 10rpx;
				padding-left: 2rpx;
				line-height: 40rpx;
				font-size: 28rpx;
				border-radius: 50%;
				margin-right: 10rpx;
				color: #fff;
				background-color: #327ffa;
			}
		}

		.cancel-login {
			font-size: 28rpx;
			height: 60rpx;
			line-height: 60rpx;
			color: #fff;
			text-align: center;
			margin-top: 20rpx;
			z-index: 5;
		}

		.login-title-info {
			font-size: 20rpx;
			color: #fff;
			width: 500rpx;
			margin-top: 100rpx;
			text-align: center;
		}
	}

	.login-form {
		padding: 40rpx;

		.codebutton {
			font-size: 24upx;
			margin: 0;
			width: 180upx;
			text-align: center;

			&:after {
				border: none
			}

			&.active {
				background-color: $color-primary;
				color: $uni-text-color-inverse;
			}
		}
	}

	button[type="primary"] {
		background-color: $color-primary;
		border-radius: 40rpx;
		font-size: 34upx;
		margin-top: 60upx;
	}

	.links {
		text-align: center;
		margin-top: 40upx;
		font-size: 26upx;
		color: #434343;

		view {
			display: inline-block;
			vertical-align: top;
			margin: 0 10upx;
		}

		.link-highlight {
			color: #434343;
		}
	}
</style>
