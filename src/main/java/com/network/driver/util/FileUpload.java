package com.network.driver.util;

import com.alibaba.druid.util.StringUtils;
import com.aliyun.oss.ClientException;
import com.aliyun.oss.OSSClient;
import com.aliyun.oss.OSSException;
import com.aliyun.oss.model.ObjectMetadata;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.util.UUID;

public class FileUpload {
	
	private static final Logger logger = LoggerFactory.getLogger(FileUpload.class);
	
	private static String responsemessage = null;

	/**
	 * 阿里云ACCESS_ID 测试
	 */
	private static String ACCESS_ID = "ONzYRFQQ7TQoVBiY";
	/**
	 * 阿里云ACCESS_KEY
	 */
	private static String ACCESS_KEY = "E6zzurPsNtKNIxCjYHaxKBf2K7xG6j";
	/**
	 * 阿里云OSS_ENDPOINT 青岛Url
	 */
	private static String OSS_ENDPOINT = "http://oss-cn-shanghai.aliyuncs.com";

	/**
	 * 阿里云BUCKET_NAME OSS
	 */
	private static String BUCKET_NAME = "myfirst1990";

	public static final double  pressPicRatio = 0.5; //图片压缩比例

	public static final int  maxFileSize = 60000; //压缩图片限制，小于此值将不压缩  60K


	public static String uploadFile(MultipartFile file,
			HttpServletRequest request) throws IOException {

		String fileName = file.getOriginalFilename();
		String endpoint = OSS_ENDPOINT;
		String accessKeyId = ACCESS_ID;
		String accessKeySecret = ACCESS_KEY;
		String bucketName = BUCKET_NAME;
		System.out.println("创建OSSClient之前");
		OSSClient client = new OSSClient(endpoint, accessKeyId, accessKeySecret);
		String key = UUID.randomUUID().toString() + fileName;
		try {
			uploadFile(client, bucketName, key, file, true,request);
		} catch (Exception e) {
			logger.error("uploadFile error:"+ e.getMessage());
			e.printStackTrace();
		} finally {
			client.shutdown();
		}
		return "http://" + bucketName + ".oss-cn-shanghai.aliyuncs.com/" + key;
	}

	public static String upFileFileInputStream(InputStream inputStream) throws IOException {
		String endpoint = OSS_ENDPOINT;
		String accessKeyId = ACCESS_ID;
		String accessKeySecret = ACCESS_KEY;
		String bucketName = BUCKET_NAME;
		System.out.println("创建OSSClient之前");
		OSSClient client = new OSSClient(endpoint, accessKeyId, accessKeySecret);
		String key =  UUID.randomUUID().toString();
		try {
			ObjectMetadata objectMeta = new ObjectMetadata();
			client.putObject(bucketName, key, inputStream, objectMeta);
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (IOException e) {
					logger.error("uploadFile close  inputStream error:" + e);
				}
			}
		}
		client.shutdown();
		return "http://" + bucketName + ".oss-cn-shanghai.aliyuncs.com/" + key;
	}
	/**
	 * @param client
	 * @param bucketName
	 * @param Objectkey
	 * @param filename
	 * @param isPress  //是否压缩图片  false 否      TRUE是
	 * @throws OSSException
	 * @throws ClientException
	 * @throws FileNotFoundException
	 */
	private static void uploadFile(OSSClient client, String bucketName,
                                   String Objectkey, MultipartFile filename, boolean isPress,
								   HttpServletRequest request) throws OSSException,
			ClientException, FileNotFoundException,IOException{
		File file =new File("/home",Objectkey);
		filename.transferTo(file);
//		CommonsMultipartFile commonsMultipartFile = (CommonsMultipartFile) filename;
//		DiskFileItem diskFileItem = (DiskFileItem) commonsMultipartFile
//				.getFileItem();
//		File file = diskFileItem.getStoreLocation();
		InputStream inputStream = null;
		//objectMeta.setContentType("image/png");
		try {
			Long fileSize = filename.getSize();
			if(maxFileSize >= fileSize || false == isPress){//图片小于此值将不再压缩
				inputStream = new FileInputStream(file);
			}else{
				String fileName = filename.getOriginalFilename();
				//获取图片的类型 如 jpg
				String fileType = getFileType(fileName);
				//压缩图片
				inputStream = ImageUtil.scaleImage(file, pressPicRatio, fileType);
			}
			ObjectMetadata objectMeta = new ObjectMetadata();
			//objectMeta.setContentLength(filename.getSize());
			client.putObject(bucketName, Objectkey, inputStream, objectMeta);
		} catch (Exception e) {
			logger.error("uploadFile error:" + e);
		} finally {
			if (inputStream != null) {  
				try {
					inputStream.close();
				} catch (IOException e) {
					logger.error("uploadFile close  inputStream error:" + e);
				}  
	    	}  
		}
	}

	/**
	 * 删除一个Bucket和其中的Objects
	 *
	 * @param client
	 *            OSSClient对象
	 * @param bucketName
	 *            Bucket名
	 * @throws OSSException
	 * @throws ClientException
	 */
	public static boolean deleteObject(String filename) throws IOException {
		OSSClient client = new OSSClient(OSS_ENDPOINT, ACCESS_ID, ACCESS_KEY);
		boolean flag = false;
		try {
			client.deleteObject(BUCKET_NAME, filename);
			flag = true;
		} catch (Exception e) {
			e.printStackTrace();
			flag = false;
		}
		client.shutdown();
		return flag;
	}

	/**
	 * 下载文件
	 *
	 * @param client
	 *            OSSClient对象
	 * @param bucketName
	 *            Bucket名
	 * @param Objectkey
	 *            上传到OSS起的名
	 * @param filename
	 *            文件下载到本地保存的路径
	 * @throws OSSException
	 * @throws ClientException
	 */
	/*
	 * private static void downloadFile(OSSClient client, String bucketName,
	 * String Objectkey, String filename) throws OSSException, ClientException {
	 * client.getObject(new GetObjectRequest(bucketName, Objectkey), new
	 * File(filename)); }
	 */

	//根据文件名称截取文件的类型    如.mp4 .jpg
	public static String getFileType(String fileName){
		if(StringUtils.isEmpty(fileName)){
			return "";
		}
		int length = fileName.lastIndexOf(".");
		return fileName.substring(length + 1, fileName.length());
	}

}