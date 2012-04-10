///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: TargetCondition. </summary>
	public partial class TargetConditionRelations
	{
		/// <summary>CTor</summary>
		public TargetConditionRelations()
		{
		}

		/// <summary>Gets all relations of the TargetConditionEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();


			toReturn.Add(this.DecisionNodeEntityUsingConditionId);
			toReturn.Add(this.TargetEntityUsingTargetId);
			return toReturn;
		}

		#region Class Property Declarations



		/// <summary>Returns a new IEntityRelation object, between TargetConditionEntity and DecisionNodeEntity over the m:1 relation they have, using the relation between the fields:
		/// TargetCondition.ConditionId - DecisionNode.Id
		/// </summary>
		public virtual IEntityRelation DecisionNodeEntityUsingConditionId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "DecisionNode", false);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, TargetConditionFields.ConditionId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("TargetConditionEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between TargetConditionEntity and TargetEntity over the m:1 relation they have, using the relation between the fields:
		/// TargetCondition.TargetId - Target.Id
		/// </summary>
		public virtual IEntityRelation TargetEntityUsingTargetId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Target", false);
				relation.AddEntityFieldPair(TargetFields.Id, TargetConditionFields.TargetId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("TargetEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("TargetConditionEntity", true);
				return relation;
			}
		}

		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
