/* 
 * 作者：钟勋 (e-mail:zhongxunking@163.com)
 */

/*
 * 修订记录:
 * @author 钟勋 2019-09-05 23:31 创建
 */
package org.antframework.configcenter.facade.result;

import lombok.Getter;
import lombok.Setter;
import org.antframework.common.util.facade.AbstractResult;
import org.antframework.configcenter.facade.vo.Property;

import javax.validation.constraints.NotNull;
import java.util.Set;

/**
 * 计算分支合并result
 */
@Getter
@Setter
public class ComputeBranchMergenceResult extends AbstractResult {
    // 需添加或修改的配置
    @NotNull
    private Set<Property> addOrModifiedProperties;
    // 需删除的配置key
    @NotNull
    private Set<String> removedPropertyKeys;
}
