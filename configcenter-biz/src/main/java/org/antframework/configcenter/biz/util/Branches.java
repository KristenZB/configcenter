/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2019-08-17 22:49 创建
 */
package org.antframework.configcenter.biz.util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.antframework.boot.core.Contexts;
import org.antframework.common.util.facade.EmptyResult;
import org.antframework.common.util.facade.FacadeUtils;
import org.antframework.common.util.tostring.ToString;
import org.antframework.configcenter.facade.api.BranchService;
import org.antframework.configcenter.facade.info.BranchInfo;
import org.antframework.configcenter.facade.order.*;
import org.antframework.configcenter.facade.result.ComputeBranchMergenceResult;
import org.antframework.configcenter.facade.result.FindBranchResult;
import org.antframework.configcenter.facade.vo.Property;

import java.io.Serializable;
import java.util.Set;

/**
 * 分支操作类
 */
public final class Branches {
    // 分支服务
    private static final BranchService BRANCH_SERVICE = Contexts.getApplicationContext().getBean(BranchService.class);

    /**
     * 发布分支
     *
     * @param appId                   应用id
     * @param profileId               环境id
     * @param branchId                分支id
     * @param addOrModifiedProperties 需添加或修改的配置
     * @param removedPropertyKeys     需删除的配置key
     * @param memo                    备注
     */
    public static BranchInfo releaseBranch(String appId,
                                           String profileId,
                                           String branchId,
                                           Set<Property> addOrModifiedProperties,
                                           Set<String> removedPropertyKeys,
                                           String memo) {
        ReleaseBranchOrder order = new ReleaseBranchOrder();
        order.setAppId(appId);
        order.setProfileId(profileId);
        order.setBranchId(branchId);
        order.setAddOrModifiedProperties(addOrModifiedProperties);
        order.setRemovedPropertyKeys(removedPropertyKeys);
        order.setMemo(memo);

        ReleaseBranchResult result = BRANCH_SERVICE.releaseBranch(order);
        FacadeUtils.assertSuccess(result);
        return result.getBranch();
    }

    /**
     * 回滚分支
     *
     * @param appId                应用id
     * @param profileId            环境id
     * @param branchId             分支id
     * @param targetReleaseVersion 回滚到的目标发布版本（传入ReleaseConstant.ORIGIN_VERSION表示删除所有发布）
     */
    public static void revertBranch(String appId, String profileId, String branchId, long targetReleaseVersion) {
        RevertBranchOrder order = new RevertBranchOrder();
        order.setAppId(appId);
        order.setProfileId(profileId);
        order.setBranchId(branchId);
        order.setTargetReleaseVersion(targetReleaseVersion);

        EmptyResult result = BRANCH_SERVICE.revertBranch(order);
        FacadeUtils.assertSuccess(result);
    }

    /**
     * 计算分支合并
     *
     * @param appId          应用id
     * @param profileId      环境id
     * @param branchId       分支id
     * @param sourceBranchId 源分支id
     * @return 分支合并的配置变更
     */
    public static ReleaseDifference computeBranchMergence(String appId, String profileId, String branchId, String sourceBranchId) {
        ComputeBranchMergenceOrder order = new ComputeBranchMergenceOrder();
        order.setAppId(appId);
        order.setProfileId(profileId);
        order.setBranchId(branchId);
        order.setSourceBranchId(sourceBranchId);

        ComputeBranchMergenceResult result = BRANCH_SERVICE.computeBranchMergence(order);
        FacadeUtils.assertSuccess(result);
        return new ReleaseDifference(result.getAddOrModifiedProperties(), result.getRemovedPropertyKeys());
    }

    /**
     * 查找分支
     *
     * @param appId     应用id
     * @param profileId 环境id
     * @param branchId  分支id
     * @return 分支（null表示无该分支）
     */
    public static BranchInfo findBranch(String appId, String profileId, String branchId) {
        FindBranchOrder order = new FindBranchOrder();
        order.setAppId(appId);
        order.setProfileId(profileId);
        order.setBranchId(branchId);

        FindBranchResult result = BRANCH_SERVICE.findBranch(order);
        FacadeUtils.assertSuccess(result);
        return result.getBranch();
    }

    /**
     * 发布之间的配置变更
     */
    @AllArgsConstructor
    @Getter
    public static class ReleaseDifference implements Serializable {
        // 需添加或修改的配置
        private final Set<Property> addOrModifiedProperties;
        // 需删除的配置key
        private final Set<String> removedPropertyKeys;

        @Override
        public String toString() {
            return ToString.toString(this);
        }
    }
}
