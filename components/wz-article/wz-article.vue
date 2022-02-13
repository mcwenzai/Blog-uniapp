<template>
	<view class="articleList">
		<view class="item" v-for="(item,index) in posts" :key="index">
			<view @tap="gotoDetail(item.uid)" class="normal-post">
				<view class="title" v-html="item.title"></view>
				<view class="info">
					<view class="left">
						<text class="icon i-dianzan"></text>
						<text>{{item.level}}</text>
						<text class="icon i-pinglun"></text>
						<text>{{item.level}}</text>
					</view>
					<view class="righr" v-if="item.tagList">
						<text class="cate">{{item.tagList[0].content}}</text>
					</view>
					<view class="righr" v-else>
						<text class="time">{{item.createTime}}</text>
					</view>
				</view>
			</view>
			<view class="cover" v-if="item.photoList">
				<image :src="item.photoList[0]" mode="aspectFill"></image>
			</view>
<!-- 			<view class="cover" v-if="item.photoUrl">
				<image :src="item.photoUrl" mode="aspectFill"></image>
			</view> -->

			<!-- </view> -->
			<view @tap="gotoDetail(item.uid)" class="video-post" v-if="item.format=='video'">
				<view class="inner">
					<image :src="item.meta.thumbnail" mode="aspectFill" class="cover"></image>
					<view class="title">
						{{item.title.rendered}}
					</view>
					<view class="summary">
						{{item.excerpt.rendered}}
					</view>
				</view>
			</view>
			<view @tap="gotoDetail(item.uid)" class="gallery-post" v-if="item.format=='gallery'">
				<view class="title">
					{{item.title.rendered}}
				</view>
				<view class="image-content">
					<view class="image-multiple">
						<view class="image" v-for="(img,idx) in item.gallery" :key="idx" v-if="idx<3">
							<image :src="img" mode="aspectFill"></image>
						</view>
					</view>
				</view>
				<view class="info">
					<view class="left">
						<text class="icon i-dianzan">{{item.likes}}喜欢</text>
						<text class="icon i-dianzan">{{item.comments}}评论</text>
						<text>{{item.meta.views}}浏览</text>
					</view>
					<view class="righr">
						<text class="cate">{{item.cate}}</text>
					</view>
				</view>
			</view>
			<view class="taglist" v-if="item.taxonomy=='post_tag'">
				<tag-list :taglist="item"></tag-list>
			</view>
			<view class="ad" v-if="item.code">
				<view class="adview" v-if="item.type=='unit'">
					<ad :unit-id="item.code"></ad>
				</view>
				<view @tap="gotoAD(item.type,item.code)" class="adview" v-else>
					<view class="adtext">
						<text>广告</text>
					</view>
					<image :src="item.thumbnail" mode="aspectFill"></image>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		name: "wz-article",
		props: {
			posts: {
				type: Array,
				default: function() {
					return [];
				}
			},
		},
		data() {
			return {

			};
		},
		mounted() {
			let _this = this;
			console.log(_this.props);
		},
		methods: {
			gotoDetail: function(uid) {
				console.log(uid);
				uni.navigateTo({
					url: '/pages/detail/detail?uid=' + uid
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.articleList {
		// padding-bottom: 60rpx;
		background-color: #ffffff;

		.item {
			padding: 32rpx;
			border-bottom: 4rpx solid #f5f5f5;
			display: flex;


			.normal-post {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				display: block;
				box-sizing: content-box;
				

				.title {
					padding-top: 10rpx;
					line-height: 52rpx;
					font-size: 34rpx;
					color: #333333;
					white-space: normal;
					word-break: normal;
					word-wrap: break-word;
					-webkit-hyphens: auto;
					-ms-hyphens: auto;
					hyphens: auto;
					min-height: 102rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}

				.info {
					margin-top: 24rpx;
					height: 38rpx;
					display: flex;       
					justify-content: space-between;

					text {
						display: inline-block;
						vertical-align: top;
						height: 32rpx;
						line-height: 32rpx;
						font-size: 24rpx;
						color: #aaaab0;
						margin-right: 20rpx;
					}
					.left {
						.icon {
							color: #96969c;
						}
					}
					.righr {
						.cate {
							font-size: 22rpx;
							background-color: #f1f3f8;
							padding: 4rpx 8rpx;
							border-radius: 14rpx;
						}
					}
				}
			}

			.cover {
				object-fit: cover;
				width: 220rpx;
				height: 200rpx;
				border-radius: 15rpx;
				padding-left: 10rpx;


				image {
					width: 220rpx;
					height: 200rpx;
					border-radius: 4px;
				}
			}


			.video-post {
				display: block;
				padding-top: 40rpx;
				position: relative;

				.inner {
					width: 100%;
					border-radius: 4px;
					background: #f5f5f5;
					overflow: hidden;
					position: relative;

					.cover {
						display: block;
						width: 100%;
						height: 400rpx;

						image {
							width: 100%;
							height: 400rpx;
						}
					}

					.title {
						padding: 16px 20px 12px;
						line-height: 23px;
						font-size: 32rpx;
						color: #333333;
						font-weight: 700;
					}

					.summary {
						padding: 0 20px 16px;
						line-height: 18px;
						font-size: 12px;
						color: #333333;
					}

					.media {
						position: absolute;
						right: 20rpx;
						height: 80rpx;
						width: 80rpx;
						top: 280rpx;
						border-radius: 4px;

						image {
							width: 80rpx;
							height: 80rpx;
						}
					}
				}
			}

			.gallery-post {
				padding-top: 40rpx;

				.title {
					padding-top: 10rpx;
					line-height: 52rpx;
					font-size: 36rpx;
					color: #333333;
					white-space: normal;
					word-break: normal;
					word-wrap: break-word;
					-webkit-hyphens: auto;
					-ms-hyphens: auto;
					hyphens: auto;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}

				.image-content {
					display: flex;
					flex-direction: column;

					.image-multiple {
						flex: 1;
						display: flex;
						flex-wrap: nowrap;

						.image {
							width: 212rpx;
							height: 212rpx;
							margin: 10rpx;
							position: relative;
							border-radius: 4px;
							overflow: hidden;

							image {
								width: 100%;
								height: 100%;
							}
						}
					}
				}

				.info {
					margin-top: 30rpx;
					height: 38rpx;
					display: flex;
					justify-content: space-between;

					text {
						display: inline-block;
						vertical-align: top;
						height: 32rpx;
						line-height: 32rpx;
						font-size: 24rpx;
						color: #969696;
						margin-right: 20rpx;
					}
				}
			}
		}
	}

	.adview {
		position: relative;

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
</style>
