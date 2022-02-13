<template>
	<view class="content">
		<view class="search-form-inner">
			<view class="search-box">
				<view class="icon i-sousuo"></view>
				<input :focus="true" @confirm="onSearchConfirm" @input="onSearchInput" class="input"
					confirmType="search" maxlength="maxLen" name="keyword" :placeholder="preKeyword||'输入关键词搜索文章'"
					placeholderClass="placeholder" type="text" :value="keyword"></input>
				<view @click="clean" class="icon i-guanbi" v-if="keyword.length>0"></view>
			</view>
			<button class="search-btn" @tap="onSearchConfirm" v-if="keyword">搜索</button>
			<button @tap="onCancelBtnClick" class="search-btn" v-else>取消</button>
		</view>
		<view class="hit_search" v-if="searchViewVisible">
			<view class="title">
				<text class="icon i-biaoti"></text>
				<text>历史搜索</text>
			</view>
			
			<view class="hit_words">
				<view @tap="searchStat(item.name)" class="relative" v-for="(item,index) in searchData" :key="index">
					<view class="keywords">{{item.name}}</view>
				</view>
			</view>
		</view>
		<view class="resulut" v-if="!searchViewVisible">
			<wz-article :posts="blogData"></wz-article>
			<u-loadmore :status="status" />
		</view>
	</view>
</template>

<script>
	import {searchBlog} from "../../api/search";
	export default {
		name: "search",
		data() {
			return {
				keyword: '',
				tags: [],
				blogData: [],
				page: 1,
				preKeyword: '输入关键词搜索文章',
				searchViewVisible: true,
				searchData: []
			}
		},
		onLoad() {
			this.getStorage()
		},
		onReachBottom() {
			if (!this.isLastPage) {
				this.getPostsList({
					keywords: this.keyword,
					currentPage: this.page
				})
			}
		},
	
		methods: {
			onSearchInput: function(e) {
				this.keyword = e.detail.value
			},
			getStorage: function() {
				this.keyword = uni.getStorageSync('keyword')
			},
			searchStat: function(keyword) {
				this.keyword = keyword;
				this.onSearchConfirm();
			},
			onSearchConfirm: function() {
				this.blogData = []
				this.page = 1;
				this.isLastPage = false;
				this.status = "loading";
				this.searchViewVisible = false;
				this.searchAddHisKey(this.keyword);
				this.getPostsList({
					keywords: this.keyword,
					currentPage: this.page
				})
			},
			getPostsList: function(args) {
				searchBlog(args).then(res => {
					if (res.data.blogList.length < 10) {
						this.isLastPage = true
						this.status = "nomore"
					}
					this.blogData = this.blogData.concat(res.data.blogList)
					this.page = this.page + 1
					this.isLoading = false
				}).catch(err => {
					console.log(err)
				})
			},
			// 添加搜索记录
			searchAddHisKey: function (keyword) {
			    var text = {}
			    let that = this;
			    text.name = keyword;
			    if (typeof (text) == "undefined" || text.length == 0) {
			        return;
			    }
			    var value = uni.getStorageSync('searchHisKeys');
			    if (value) {
			        if (JSON.stringify(value).indexOf(JSON.stringify(text)) < 0) {
			            if (value.length > 4) {
			                value.pop();
			            }
			            value.unshift(text);
			        }
			        uni.setStorage({
			            key: "searchHisKeys",
			            data: value,
			            success: function () {
			                that.getHisKeys();
			            }
			        })
			    } else {
			        value = [];
			        value.push(text);
			        uni.setStorage({
			            key: "searchHisKeys",
			            data: value,
			            success: function () {
			                that.getHisKeys();
			            }
			        })
			    }
			},
			// 获取记录
			getHisKeys: function () {
			    var value = [];
			    try {
			        value = uni.getStorageSync('searchHisKeys')
			        if (value) {
			            this.searchData = value
			        }
			    } catch (e) {}
			},
			clean: function() {
				this.keyword = '';
				this.blogData = [];
				this.page = 1;
				this.isLastPage = false;
				this.status = "loading";
				this.searchViewVisible = true;
			},
			onCancelBtnClick: function() {
				uni.navigateBack({
					delta: 1
				})
			}
		},
	}
</script>

<style lang="scss" scoped>
	.search-form-inner {
		position: fixed;
		left: 0;
		padding: 30rpx;
		height: 100rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		background-color: #fff;
		z-index: 11;

		.search-box {
			flex: 1;
			width: 528rpx;
			height: 60rpx;
			padding: 0 14rpx 0 30rpx;
			border-radius: 30rpx;
			display: flex;
			align-items: center;
			background-color: #f4f3f7;

			.i-sousuo {
				font-size: 28rpx;
				color: #b3b3b3;
				width: 38rpx;
				height: 48rpx;
				line-height: 48rpx;
			}

			.i-guanbi {
				font-size: 28rpx;
				color: #b3b3b3;
				width: 38rpx;
				height: 48rpx;
				line-height: 48rpx;
			}


			.input {
				flex: 1;
				font-size: 28rpx;
				color: #252628;
			}

			.placeholder {
				font-size: 28rpx;
				color: #b7b5c2;
			}
		}

		.search-btn,
		.cancel-btn {
			width: 100rpx;
			height: 54rpx;
			margin-left: 20rpx;
			line-height: 54rpx;
			padding: 0;
			border: none;
			font-size: 26rpx;
			color: #1063e8;
		}
		
		.search-btn::after{ border: none; }

	}

	.hit_search {
		padding: 133rpx 32rpx 0;
		.title {
			line-height: 44rpx;
			height: 44rpx;
			.icon {
				color: #327ffa;
				font-size: 29rpx;
			}
		}

		.hit_words,
		.relative {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
		}

		.keywords {
			color: #6b6a72;
			display: inline-block;
			background: #f4f3f7;
			border-radius: 100rpx;
			padding: 14rpx 33rpx;
			margin: 20rpx 20rpx 0 0;
			max-width: 260rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: 22rpx;
		}
	}

	.resulut {
		padding: 100rpx 0rpx;
	}
</style>