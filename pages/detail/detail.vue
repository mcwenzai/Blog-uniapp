<template>
	<view class="content">
		<view class="topic-detail" v-if="!loading">
			<view class="article-info">
				<view class="article-detail-author">
					<text>{{detail.blogSort.sortName}}</text>
					<view></view>
					<span>{{detail.blogSort.updateTime}}</span>
					<view></view>
					<span>{{detail.blogSort.clickCount}} 浏览</span>
				</view>
				<view class="article-detail-title article-wrap">{{detail.title}}</view>
			</view>
			<view :class="videoAds?'container':''" id="entry-content" class="entry-content clearfix">
				<u-parse :content="detail.content" ref="article" :tagStyle="tagStyle" :lazyLoad="true"></u-parse>
			</view>
			<view class="subScribeButton" v-if="videoAds">
				<button class="cu-btn round bg-green" @tap="bindReadMore">观看视频阅读更多...</button>
			</view>
		</view>

		<view class="item_container" v-if="!loading">
			<view>
				<text class="item_time">————本文更新于{{detail.blogSort.updateTime}}————</text>
			</view>

			<!-- #ifdef MP -->
			<view class="item_share_container">
				<button class="item_friend_container" data-from="bottom" openType="share">
					<text class="text">分享好友</text>
					<image class="image" src="http://mat1.gtimg.com/www/js/news/icon_pinglun_weixin.png"></image>
				</button>
				<button @tap="getLinks" class="item_friend_container" style="margin-left:30rpx;">
					<text class="text">分享链接</text>
					<image class="image" src="http://mat1.gtimg.com/www/js/news/icon_pinglun_pyq.png"></image>
				</button>
			</view>
			<!-- #endif -->

			<!-- #ifdef APP-PLUS -->
			<view class="item_share_container">
				<button class="item_friend_container" data-from="bottom" @click="appShares">
					<text class="text">分享好友</text>
					<image class="image" src="http://mat1.gtimg.com/www/js/news/icon_pinglun_weixin.png"></image>
				</button>
				<button @tap="getLinks" class="item_friend_container" style="margin-left:30rpx;">
					<text class="text">分享链接</text>
					<image class="image" src="http://mat1.gtimg.com/www/js/news/icon_pinglun_pyq.png"></image>
				</button>
			</view>
			<!-- #endif -->
		</view>

		<view class="ad" v-if="advert.code">
			<view class="adview" v-if="advert.type=='unit'">
				<ad :unit-id="advert.code"></ad>
			</view>
			<view @tap="gotoAD(advert.type,advert.code)" class="adview" v-else>
				<view class="adtext">
					<text>广告</text>
				</view>
				<image :src="advert.thumbnail" mode="aspectFill"></image>
			</view>
		</view>

		<view class="s-tags" v-if="detail.tags">
			<view @tap="gotoTag(item.id)" class="s-tag" v-for="(item,index) in detail.tags" :key="index">#{{item.name}}
			</view>
		</view>

		<wz-gap height="20" bgColor="#f5f5f5"></wz-gap>
		<wz-recommend :recommendList="sameBlogByBlog"></wz-recommend>
		<wz-gap height="20" bgColor="#f5f5f5"></wz-gap>
		<wz-comment :commentList="commentList" :commentCountTotal="detail.comments" @reply="reply"
			@tapLikes="tapcommentLike" @showRecommendList="showRecommend" :isNewest="isNewest"
			@showNewestList="showNewest">
		</wz-comment>

		<view :class="!isInput?'comment-submit is-show':'comment-dialog is-hide'">
			<view class="comment-submit-left">
				<view @tap="tapComment" class="comment-submit-btn">写评论...</view>
			</view>
			<view class="comment-submit-right">
				<view @tap="tapComment" class="submit">
					<view class="icon i-8pinglun"></view>
					<view v-if="detail.comments>0">{{detail.comments}}</view>
					<view v-else>评论</view>
				</view>
				<view @tap="tapFav" class="submit" v-if="detail.isfav===false">
					<view class="icon i-shoucang2"></view>
					<view>收藏</view>
				</view>
				<view @tap="tapFav" class="submit" v-else>
					<view class="icon i-shoucang"></view>
					<view>取消收藏</view>
				</view>
				<view @tap="tapLike" class="submit">
					<view :class="detail.islike===false?'icon i-dianzan1':'icon i-dianzan2'">
					</view>
					<view v-if="favourSum>0">{{favourSumFormat}}</view>
					<view v-else>点赞</view>
				</view>
			</view>
		</view>

		<u-popup :show="isComments" mode="bottom" :safeAreaInsetBottom="true" zIndex="10071" :round="10"
			@close="outComment">
			<view class="textareacontent">
				<view class="textheaders">
					<view @tap="outComment" class="cancel">取消</view>
					<view class="publish" @tap="addComment">发布</view>
				</view>
				<view class="textareaBox">
					<textarea class="textareaInput" maxlength="100" :show-confirm-bar="false" name="content"
						@input="bindInput" @blur="onReplyBlur" @focus="onRepleyFocus" :placeholder="placeholder"
						placeholder-class="placeholder-text" :value="content"></textarea>
					<view class="textCount">{{count}}/100</view>
				</view>
			</view>
		</u-popup>
	</view>
	</view>
</template>

<script>
	import {
		getBlogByUid,
		praiseBlogByUid,
		getSameBlogByBlogUid,
		postCommentList
	} from "../../api/blogContent.js";
	import {
		getCommentListByApp,
		addComment
	} from "../../api/comment.js"
	var app = getApp();
	let videoAd = null;
	export default {
		data() {
			return {
				loading: true,
				advert: [],
				videoAds: false,
				isVideoAds: false,
				user: '',
				count: 0,
				detail: [],
				content: '',
				isFocus: true,
				topshow: true,
				placeholder: '写评论...',
				recommendList: [],
				commentList: [],
				page: 1,
				isLike: false,
				isFav: false,
				isComments: false,
				favourSum: 0,
				isInput: false,
				isPublish: false,
				isNewest: true,
				tagStyle: {
					img: 'width:100%;display:block;',
					table: 'width:100%',
					video: 'width:100%',
					p: 'padding-top:20rpx',
					button: 'border-width: 2rpx;border-color: #5b96fe;border-style: solid;border-radius: calc((50rpx - 4rpx) / 2);font-size: 26rpx;background-color: #5b96fe;display: flex;color: #fff;align-items: center;justify-content:center;padding:20rpx 40rpx;margin:20rpx auto;'
				},
				sameBlogByBlog: []
			}
		},
		onLoad(options) {
			console.log(options)
			this.id = options.uid;
			this.getPostsDetail(options.uid);
			this.getSameBlogByBlog(options.uid);
		},
		onShow() {
			let user = app.globalData.user
			if (!user) {
				user = '';
			}
			this.user = user;
		},

		onShareAppMessage: function() {
			return {
				title: this.detail.title.rendered,
				imageUrl: this.detail.meta.thumbnail,
				path: '/pages/detail/detail?id=' + this.detail.id
			}
		},
		onShareTimeline: function(res) {
			return {
				title: this.detail.title.rendered,
				query: 'id=' + this.detail.id,
				imageUrl: this.detail.meta.thumbnail
			}
		},
		onReachBottom() {
			if (!this.isLastPage && this.isNewest) {
				this.getPostsComments({
					blogUid: this.id,
					currentPage: 1,
					pageSize: 10,
					source: "BLOG_INFO"
				});
			}
			if (!this.isLastPage && !this.isNewest) {
				this.getPostsComments({
					blogUid: this.id,
					currentPage: 1,
					pageSize: 10,
					source: "BLOG_INFO"
				});
			}
		},
		onShow() {
			let user = app.globalData.user
			if (!user) {
				user = '';
			}
			this.user = user;
		},

		onPageScroll: function(e) {
			if (e.scrollTop < 10) {
				this.topshow = true;
			} else {
				this.topshow = false;
			}
		},
		methods: {

			getLinks: function() {
				uni.setClipboardData({
					data: this.detail.link,
					success: function() {
						uni.showToast({
							title: '链接已复制'
						})
					}
				})
			},

			getSameBlogByBlog: function(uid) {
				let params = {
					blogUid: uid
				}
				getSameBlogByBlogUid(params).then(res => {
						this.sameBlogByBlog = res.data.records
					})
					.catch(err => {
						console.log(err)
					})
			},

			getPostsDetail: function(uid) {
				let params = {
					uid: uid
				}
				getBlogByUid(params).then(res => {
						this.detail = res.data;
						uni.setNavigationBarTitle({
							title: res.data.title
						})
						this.loading = false;
						let videoAdLogs = uni.getStorageSync('videoAdLogs') || [];
						if (videoAdLogs.indexOf(this.id) > -1) {
							this.videoAds = false;
						} else {
							this.videoAds = res.we_video_ad;
							this.isVideoAds = true;
						}
						//阅读浏览历史记录
						let logs = uni.getStorageSync('readLogs') || []
						let isLogs = true
						if (logs.length > 0) {
							for (let i = 0; i < logs.length; i++) {
								if (logs[i].id == res.id) {
									isLogs = false
									break
								}
							}
						}
						if (isLogs) {
							logs.unshift(res)
						}
						if (logs.length > 50) {
							logs.pop();
						}
						uni.setStorageSync('readLogs', logs)
						//阅读浏览历史结束
					})
					.catch(err => {

					})
			},

			bindReadMore: function() {
				let that = this
				uni.getSystemInfo({
					success: function(e) {
						if (e.platform == 'devtools') {
							console.log("开发工具不支持显示视频")
							that.isVideoAds = false;
							that.videoAds = false
						} else if (videoAd) {
							videoAd.show().catch(() => {
								videoAd.load().then(() => videoAd.show())
									.catch(err => {
										console.log('视频显示错误', err)
									})
							})
						}
					}
				})
			},
			gotoDetail(id) {
				uni.navigateTo({
					url: '../detail/detail?id=' + id
				})
			},
			reply: function(e) {
				let parent = e.data.id
				let reply = e.data.author.name
				this.isFocus = true,
					this.isComments = true,
					this.parent = parent,
					this.placeholder = " @" + reply + ":"

			},

			tapcommentLike: function(e) {
				let that = this
				let id = e.id
				let index = e.index
				API.markComment({
						id: id
					}).then(res => {
						if (res.status == 200) {
							that.commentList[index].islike = true
							that.commentList[index].likes += 1

						} else if (res.status == 202) {
							that.commentList[index].islike = false
							that.commentList[index].likes -= 1
						}
					})
					.catch(err => {
						wx.showToast({
							title: err.message,
							icon: 'loading',
							duration: 1000
						})
					})
			},
			gotoCate: function(id) {
				uni.navigateTo({
					url: '../list/list?id=' + id
				})
			},

			getPostsComments: function(args) {
				postCommentList(args).then(res => {
						if (res.data.length < 10) {
							this.isLastPage = true
						}
						this.commentList = this.commentList.concat(res);
						this.page = this.page + 1;
					})
					.catch(err => {
						console.log(err)
					})
			},

			tapLike: function() {
				if (this.user == '') {
					this.notLogin()
				} else {
					let detail = this.detail
					let count = detail.likes
					addlike({
							id: detail.id
						}).then(res => {
							if (res.status === 200) {
								uni.showToast({
									title: '谢谢点赞!',
									icon: 'success',
									duration: 900
								})
								detail.islike = true
								detail.likes = count + 1
								this.detail = detail

							} else if (res.status === 202) {
								uni.showToast({
									title: '取消点赞!',
									icon: 'success',
									duration: 900
								})
								detail.islike = false
								detail.likes = count - 1
								this.detail = detail
							} else {
								if (res.message) {
									uni.showModal({
										title: '温馨提示',
										content: err.message
									})
								} else {
									uni.showToast({
										title: '点赞失败!',
										icon: 'loading',
										duration: 900
									})
								}
							}
						})
						.catch(err => {
							if (err.message) {
								uni.showModal({
									title: '温馨提示',
									content: err.message
								})
							}
						})
				}
			},
			tapFav() {
				if (this.user == '') {
					this.notLogin()
				} else {
					console.log("jasd")
					let detail = this.detail
					let count = detail.likes
					addFav({
							id: detail.id
						}).then(res => {
							if (res.status === 200) {
								uni.showToast({
									title: '谢谢收藏!',
									icon: 'success',
									duration: 900
								})
								detail.isfav = true
								detail.favs = count + 1
								this.detail = detail
							} else if (res.status === 202) {
								uni.showToast({
									title: '取消收藏!',
									icon: 'success',
									duration: 900
								})
								detail.isfav = false
								detail.favs = count - 1
								this.detail = detail
							} else {
								if (res.message) {
									uni.showModal({
										title: '温馨提示',
										content: err.message
									})
								} else {
									uni.showToast({
										title: '收藏失败!',
										icon: 'loading',
										duration: 900
									})
								}
							}
						})
						.catch(err => {
							console.log(err)
							if (err.message) {
								uni.showModal({
									title: '温馨提示',
									content: err.message
								})
							}
						})
				}
			},
			tapComment: function() {
				this.isComments = true;
			},
			outComment: function() {
				this.isComments = false;
				this.parent = 0;
				this.placeholder = '写点评论...'
			},

			bindInput: function(e) {
				this.content = e.detail.value;
				this.count = this.content.length;
			},
			addComment: function() {
				let args = {}
				if (!this.user) {
					this.isComments = false
					this.notLogin()
				} else {
					args.id = this.id
					args.parent = this.parent
					args.content = this.content
					if (this.content.length === 0) {
						uni.showToast({
							title: '请填写评论内容',
							icon: 'none'
						})
						return
					}
					addComment(args).then(res => {
							if (res.status === 200) {
								this.page = 1;
								this.content = "";
								this.commentList = [];
								this.isFocus = false;
								this.isComments = false;
								this.getPostsComments({
									id: this.id,
									page: this.page,
									orderby: 'likes',
								})
								setTimeout(function() {
									uni.showToast({
										title: res.message,
										icon: 'success',
										duration: 900
									})
								}, 900)
							} else if (res.status === 500) {
								uni.showModal({
									title: '温馨提示',
									content: res.message
								})
							}
						})
						.catch(err => {
							console.log(err)
							if (err.message) {
								uni.showModal({
									title: '温馨提示',
									content: err.message
								})
							} else {
								uni.showToast({
									title: '未知错误!',
									icon: 'loading',
									duration: 900
								})
							}
						})
				}
			},

			notLogin: function() {
				uni.showModal({
					title: '温馨提示',
					content: '您暂未登陆, 是否前往登陆',
					success: function(res) {
						if (res.confirm) {
							setTimeout(function() {
								uni.navigateTo({
									url: '/pages/login/login',
								});
							}, 100);
						}
					},
					fail: function(err) {
						console.log(err)
					}
				})
				return
			},

			bindCopy: function(code) {
				wx.setClipboardData({
					data: code,
					success: function(res) {
						wx.getClipboardData()
					}
				})
			},

			Copylink: function(link) {
				this.bindCopy(link)
			},

			bindCopyLink: function(link) {
				this.bindCopy(link)
			},

			bindCopyCode: function(code) {
				this.bindCopy(code)
			},

			gotoTag: function(id) {
				uni.navigateTo({
					url: '../tag/tag?id=' + id
				})
			},

			showRecommend: function() {
				this.isNewest = true,
					this.page = 1,
					this.commentList = [],
					this.getPostsComments({
						id: this.id,
						page: this.page,
						orderby: 'likes',
					})
			},

			showNewest: function() {
				this.isNewest = false,
					this.page = 1,
					this.commentList = [],
					this.getPostsComments({
						id: this.id,
						page: this.page,
						orderby: 'comment_date',
					})
			},

			gotoAD: function(type, code) {
				if (type == "app") {
					let urls = code.split("|");
					let appid = urls[0];
					let path = urls[1] || 'pages/index/index';
					uni.navigateToMiniProgram({
						appId: appid,
						path: path,
					})
				} else if (type === 'picture') {
					uni.navigateTo({
						url: code,
					})
				} else if (type === 'site') {
					uni.navigateTo({
						url: '/pages/view/view?url=' + code
					})
				}
			},

			wxParseCreditPay: function(credits) {
				let args = {}
				let that = this
				let credit = credits
				args.id = this.id
				args.payment = 'credit'
				args.expenses = credit
				if (!this.user) {
					uni.navigateTo({
						url: '/pages/login/login'
					})
					return
				}
				uni.showModal({
					title: '温馨提示',
					content: '确认使用 ' + credit + ' 积分阅读本篇文章?',
					cancelColor: '#D0104C',
					confirmColor: '#D0104C',
					confirmText: '确认',
					success: response => {
						if (response.confirm) {
							API.creditSubscribe(args).then(res => {
									if (res.status == 200) {
										that.getPostsDetail(that.id)
										uni.showToast({
											title: res.message,
											icon: 'success',
											duration: 900
										})
									}
								})
								.catch(err => {
									if (err.data.status = 403) {
										uni.showModal({
											title: '温馨提示',
											showCancel: false,
											content: err.message
										})
									} else {
										uni.showToast({
											title: '未知错误!',
											icon: 'loading',
											duration: 900
										})
									}
								})
						} else {
							uni.showToast({
								title: '取消成功!',
								icon: 'success',
								duration: 900
							})
						}
					}
				})
			},

			/**
			 *  点击导航栏 buttons 时触发
			 */
			onNavigationBarButtonTap() {
				var that = this;
				// var url = API.GetWebUrl() + "archives/" + that.cid + "/"
				var url = window.location.href
				// if (that.slug != "") {
				// 	url = API.GetWebUrl() + that.slug + ".html"
				// }
				// #ifdef APP-PLUS
				uni.shareWithSystem({
					href: url,
					summary: that.title,
					success() {
						console.log("分享成功")
					},
					fail() {
						console.log("分享失败")
					}
				});
				// #endif
				// #ifdef h5
				that.ToCopy(url);
				// #endif
			}
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		padding-bottom: 100rpx;
	}

	.topic-detail {

		.detail-header {
			box-sizing: border-box;
			display: flex;
			align-items: center;
			position: fixed;
			left: 0;
			top: -100rpx;
			z-index: 3;
			width: 100vw;
			height: 100rpx;
			padding: 0 54rpx;
			background-color: rgba(255, 255, 255, 0.9);
			backdrop-filter: blur(4rpx);
			transition: transform 0.5s;

			image {
				flex: 0 0 auto;
				width: 60rpx;
				height: 60rpx;
				margin-right: 16rpx;
				border-radius: 8rpx;
			}

			.detail-header-name {
				flex: 1 1 auto;
				overflow: hidden;

				text {
					display: block;
					font-size: 32rpx;
					font-weight: bold;
					color: #3b3b3b;
					line-height: 40rpx;
				}

				span {
					display: block;
					font-size: 24rpx;
					font-weight: normal;
					color: #ababab;
					line-height: 28rpx;
				}

				.g-text-overflow {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.detail-header-btn {
				&::before {
					border-radius: 32rpx;
					border-color: #3b3b3b;
				}

				flex: 0 0 auto;
				width: 128rpx;
				height: 60rpx;
				font-size: 24rpx;
				text-align: center;
				line-height: 60rpx;
				font-weight: normal;
				color: #3b3b3b;
				border-radius: 16rpx;

			}


			.half-pixel-border {
				position: relative;

				&::before {
					content: '';
					position: absolute;
					box-sizing: border-box;
					left: 0;
					top: 0;
					width: 200%;
					height: 200%;
					border-radius: inherit;
					transform-origin: 0 0;
					transform: scale(0.5, 0.5);
					border: 1px solid rgba(0, 0, 0, 0.1);
				}

			}

		}

		.half-pixel-bottom-border {
			position: relative;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				bottom: 0;
				width: 100%;
				height: 1px;
				background-color: #c2c2c2;
				transform: scaleY(0.4);
				transform-origin: 50% 100%;
			}
		}

		.detail-header-show {
			transform: translate3d(0, 100%, 0);
		}
	}

	.article-info {
		background: #fff;
		padding-top: 40rpx;
		border-radius: 15rpx;

		.article-detail-author {
			display: flex;
			padding: 28rpx 30rpx 28rpx 28rpx;
			font-size: 24rpx;
			line-height: 1;

			text {
				font-weight: bold;
			}

			view {
				width: 2rpx;
				height: 22rpx;
				margin: 0 18rpx;
				background-color: #ABABAB;
			}

			span {
				color: #ababab;
			}
		}

		.article-detail-title {
			margin-bottom: 98rpx;
			font-size: 54rpx;
			color: #3b3b3b;
			line-height: 87rpx;
			font-family: 'zaker-title';
		}

		.article-wrap {
			padding: 0 30rpx;
		}


	}

	.entry-content {
		clear: both;
		color: #404246;
		margin: 0;
		padding: 0 30rpx;
		font-size: 36rpx;
		line-height: 70rpx;
		text-align: justify;
		word-wrap: break-word;
		word-break: normal;
		font-family: Impact, Haettenschweiler, ‘Arial Narrow Bold’, sans-serif;

		video {
			width: 100% !important;
		}

		image {
			width: 100% !important;
		}
	}

	.comment-submit {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 166rpx;
		padding: 24rpx 18rpx 46rpx 24rpx;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		background: #fff;
		box-shadow: 0 2px 10px 0 rgba(155, 161, 168, .3);
		z-index: 10075;

		.comment-submit-btn {
			max-width: 384rpx;
			min-width: 384rpx;
			height: 80rpx;
			background: rgba(187, 194, 202, .2);
			border-radius: 40rpx;
			padding: 18rpx 30rpx 17rpx;
			box-sizing: border-box;
			font-size: 32rpx;
			color: rgba(47, 47, 47, .5);
		}
	}

	.comment-dialog {
		position: fixed;
		flex-direction: column;
	}

	.is-show {
		display: flex;
	}

	.is-hide {
		display: none;
	}

	.submit,
	.comment-submit-right {
		display: flex;
	}

	.submit {
		flex-direction: column;
		align-items: center;
		width: 96rpx;
		height: 96rpx;
		margin-right: 6rpx;

		.icon {
			font-size: 38rpx;
		}

		.i-shoucang {
			color: #327ffa;
		}

		.i-dianzan1 {
			color: #327ffa;
		}
	}

	.submit:last-child {
		margin-right: 0;
	}

	.submit .comment-submit-image {
		display: inline-block;
		width: 36rpx;
		height: 36rpx;
		margin-top: 11rpx;
	}


	.submit view {
		margin-top: 6rpx;
		font-size: 24rpx;
		color: #6c788e;
		line-height: 33rpx;
	}

	.container {
		height: 600rpx;
		overflow: hidden;
		position: relative;
	}


	/**
	*  文章底部分享
	*/

	.item_container {
		height: auto;
		width: auto;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding: 40rpx 0;

		.item_time {
			font-family: PingFangSC-Regular;
			font-size: 24rpx;
			color: #999999;
			letter-spacing: 0;
		}

		.item_share_container {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			margin-top: 34rpx;
			margin-bottom: 100rpx;

			.item_friend_container {
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				background: #fff;
				box-shadow: 0 2rpx 8rpx 0 rgba(0, 0, 0, 0.10);
				border-radius: 40rpx;
				background-color: rgba(0, 0, 0, 0);
				padding-left: 20rpx;
				padding-right: 20rpx;

				.text {
					font-family: PingFangSC-Regular;
					font-size: 28rpx;
					color: #222;
					letter-spacing: 0;
				}

				.image {
					width: 40rpx;
					height: 40rpx;
					margin-left: 20rpx;
				}

			}
		}

		button {
			background: none;
			display: block;
			margin: 0;
			padding: 0;

			&::after {
				border: 0;
				background: none;
			}
		}

	}

	.subScribeButton {
		text-align: center;
		margin: 30rpx 120rpx;

		button {
			font-size: 28rpx;
			background-color: #39b54a;
			color: #fff;
		}
	}

	.textareacontent {
		border-top-left-radius: 16rpx;
		border-top-right-radius: 16rpx;
		background-color: #fff;
		z-index: 10;

		.textheaders {
			width: 100%;
			height: 96rpx;
			border-bottom: 1rpx solid #eaeaea;
			display: flex;
			justify-content: space-between;

			.cancel {
				color: #333;
				font-size: 32rpx;
				line-height: 96rpx;
				margin-left: 32rpx;
			}

			.publish {
				color: #3ec382;
				font-size: 32rpx;
				line-height: 96rpx;
				margin-right: 32rpx;
			}
		}

		.textareaBox {
			height: 420rpx;
			position: relative;

			.textCount {
				position: absolute;
				font-size: 26rpx;
				color: #999;
				right: 32rpx;
				top: 4rpx;
			}

			.textareaInput {
				margin: 30rpx;
			}
		}
	}

	.entry-page {
		border-top: 20rpx solid #f5f5f5;
		padding: 30rpx;
		overflow: hidden;

		.title {
			font-size: 36rpx;
		}

		.entry-page-prev {
			position: relative;
			width: 100%;
			padding: 8rpx 0rpx;
			overflow: hidden;
			border-bottom: 2rpx solid #f5f5f5;

			&:before {
				width: 100%;
				height: 100%;
				content: "";
			}

			.title {
				width: 100%;
				height: 100%;
				font-size: 28rpx;

				text {
					display: block;
					height: 48rpx;
					line-height: 50rpx;
					overflow: hidden;
					-o-text-overflow: ellipsis;
					text-overflow: ellipsis;
					-webkit-box-orient: vertical;
					display: -webkit-box;
					-webkit-line-clamp: 1;
				}
			}

			.entry-page-info {
				display: flex;
				justify-content: space-between;
				position: relative;
				font-size: 24rpx;
				height: 42rpx;
				line-height: 42rpx;
				overflow: hidden;
			}
		}

		.entry-page-next {
			position: relative;
			width: 100%;
			margin-top: 30rpx;
			padding: 60rpx 15rpx 10rpx;
			color: #fff;
			background-size: cover;
			background-position: 50%;
			border-radius: 4px;
			overflow: hidden;

			&:before {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				background: rgba(0, 0, 0, .5);
				content: "";
			}

			.title {
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				z-index: 1;
				color: #fff;
				font-size: 28rpx;

				text {
					display: block;
					padding: 30rpx 30rpx;
					height: 80rpx;
					line-height: 50rpx;
					overflow: hidden;
					-o-text-overflow: ellipsis;
					text-overflow: ellipsis;
					-webkit-box-orient: vertical;
					display: -webkit-box;
					-webkit-line-clamp: 1;
				}
			}

			.entry-page-info {
				padding: 30rpx 10rpx;
				display: flex;
				justify-content: space-between;
				position: relative;
				font-size: 24rpx;
				line-height: 32rpx;
				overflow: hidden;
			}
		}
	}

	.s-tags {
		margin: 30rpx;
	}

	.s-tag {
		display: inline-block;
		margin: 0 7px 12px 0;
		padding: 2px 12px;
		border-radius: 32px;
		background-color: #edf1f7;
		line-height: 1.8;
		font-size: 14px;
		font-weight: 700;
		color: #5a91e1;
		text-transform: uppercase;
	}

	.adview {
		position: relative;
		padding: 30rpx;

		.adtext {
			position: absolute;
			top: 10rpx;
			right: 20rpx;
			padding: 5rpx 20rpx;
			background: #333;
			color: #fff;
			font-size: 24rpx;
		}

		image {
			width: 690rpx;
			height: 200rpx;
		}
	}

	.netDisk-card {
		.title {
			font-size: 34rpx;
			font-weight: bold;
			padding: 40rpx 0rpx;
		}

		height: auto;
		display: block;
		overflow: visible;
		margin: 30rpx;
		padding-top: 40rpx;
		background-color: #fff;

		.netDisk-card-text {
			color: #666;
			font-size: 1.2em;
			line-height: 1.75;
			letter-spacing: 2rpx;
			padding-bottom: 40rpx;

			.netDisk-card-strong {
				font-weight: bolder;
			}

			.netDisk-card-inline {
				display: inline;
			}

			.netDisk-card-copy-text {
				color: #21759b;
				margin-left: 20rpx;
			}
		}
	}
</style>
